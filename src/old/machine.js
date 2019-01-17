import { Machine, actions } from 'xstate';
const { assign } = actions;

// Action to increment the context amount
const addWater = assign({
  amount: (ctx, event) => ctx.amount + 1
});

// Guard to check if the glass is full
function glassIsFull(ctx, event) {
  return ctx.amount >= 10;
}

const glassMachine = Machine(
  {
    id: 'glass',
    // the initial context (extended state) of the statechart
    context: {
      amount: 0
    },
    initial: 'empty',
    states: {
      empty: {
        on: {
          FILL: {
            target: 'filling',
            actions: 'addWater'
          }
        }
      },
      filling: {
        on: {
          // Transient transition
          '': {
            target: 'full',
            cond: 'glassIsFull'
          },
          FILL: {
            target: 'filling',
            actions: 'addWater'
          }
        }
      },
      full: {}
    }
  },
  {
    actions: { addWater },
    guards: { glassIsFull }
  }
);

const setCountry = assign({
    country: (ctx, event) => ctx.country
  });

  const resetCountry = assign({
    country: ''
  });

const hoverMachine = Machine(
    {
      id: 'hover',
      // the initial context (extended state) of the statechart
      context: {
        country: ''
      },
      initial: 'idle',
      states: {
        idle: {
          on: {
            HOVER: {
              target: 'hovering',
              actions: 'setCountry'
            }
          }
        },
        hovering: {
          on: {
            // Transient transition
            UNHOVER: {
              target: 'idle',
              actions: 'resetCountry'
            }
          }
        }
      }
    },
    {
      actions: { setCountry, resetCountry },
    }
  );

  const routeMachine = Machine(
    {
      id: 'app',
      // the initial context (extended state) of the statechart
      
      initial: 'home',
      on: {
          GOTO_HOME: 'home',
          GOTO_ABOUT: 'about',
          GOTO_CONTACT: 'contact',
          GOTO_OTHER: 'someOtherRoute'
      },
      states: {
        home:{
            onEntry: 'gotoHome'
        },
        about: {
            onEntry: 'gotoAbout'
        },
        contact: {
            onEntry: 'gotoContact'
        },
        someOtherRoute: {
            onEntry: 'gotoOther'
        }
      }
    },
    {
      actions: { 
        gotoHome: () => console.log('/'),
        gotoAbout: () => console.log('/about'),
        gotoContact: () => console.log('/contact'),
        gotoOther: () => console.log('/other')
       },
    }
  );

import {writable} from 'svelte/store';
import { interpret } from 'xstate/lib/interpreter';

function createMachineStore(machine) {
    
    const state = machine.initialState
    const {subscribe, set, update} = writable(state);
    const service = interpret(machine);
    console.log(service)
    service.onTransition(nextState => {
        set(nextState)
    })
    service.start();

    

    function reset(ctx){
        if (ctx) {
            set(machine.withContext(ctx).initialState);
        } else {
            set(machine.initialState);
        }
    }

    function transition (event, ctx) {
        if (ctx) {
            set(machine.withContext(ctx).initialState);
        } else {
            service.send(event)
        }

        // update(v => {
        //     console.log(v)
        //     return machine.transition(v, event)
        // })
    }
    

    return {
        subscribe,
        reset,
        transition
    }
}

export const glass = createMachineStore(glassMachine);
export const hover = createMachineStore(hoverMachine);
export const routes = createMachineStore(routeMachine);
