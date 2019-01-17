import { writable } from 'svelte/store';
import {Machine} from 'xstate'
import { interpret } from 'xstate/lib/interpreter';

import { mediaMachine } from './machine.js';

export const mediaPlayer = createMachineStore(mediaMachine);

// I stuck everything in here for now because i didn't want to think about API design
// this would not be how we actually do it, we would have a cleaner implementation / abstraction
// i just don't know what that looks like yet.

function createMachineStore(machineConfig) {

    // this is our actual state, it is separate from the SM, 
    // only actions know about it and only update it through `update`
    const player = {
        playlists: [
            {author: "aFoo", title: "tFoo", tracks: [1, 2, 3, 4, 5, 6]},
            {author: "aBar", title: "tBar", tracks: [1, 2, 3, 4, 5, 6]},
            {author: "aQoo", title: "tQoo", tracks: [1, 2, 3, 4, 5, 6]},
        ],
        currentPlaylist: 0,
        currentTrack: 5,
        currentDuration: 87,
        totalDuration: 215,
        playState: 'STOP'
      }

    // the store
    const {subscribe, update} = writable(player);

    // so these actions essentially just update the actual state based on the events that get fired
    // in the real world they woudl also hook into our audio player 
    //              or viz in order to update those values as well
    const actions = {
        setPlayState (state) {
            // this would be changed, i just didn't want to write a dozen actions
            if (!['PLAY', 'PAUSE', 'STOP'].includes(state)) return;
            update(v => typeof state !== 'string' ? v : ({...v, playState: state}));
        },
        // this might be a bit too generic but works fine for now
        change(value) {
            update(v => {  
                let {playlists, currentPlaylist, currentTrack} = {...v};

                if (!playlists[currentPlaylist].tracks[currentTrack + value]) {
                    if (!v.playlists[currentPlaylist + value]) {
                        return v;
                    }
                    
                    currentPlaylist += value;
                    currentTrack = value > 0 ? 0 : playlists[currentPlaylist].tracks.length -1
                } else {
                    currentTrack += value;
                }

                return {...v, currentPlaylist, currentTrack, currentDuration: 0};
            })
        },
        seek(val){
            update(v => ({...v, currentDuration: (val / 100) * v.totalDuration}));
        }

    } 

    // the actual state machine
    const machine = Machine(machineConfig, {
        actions: {
            seek: (ctx, evt) => actions.seek(evt.time),
            change: (ctx, evt) => {
                actions.change(evt.direction)
                // this 'RESOLVE' event would probably come from a successful request or whatever
                service.send('RESOLVE')
            },
            setPlayState: (ctx, evt) => actions.setPlayState(evt.type)
        },
        activities: {
            // just a fake timer to update the duration with
            incr: () => {
                const interval = setInterval(() => {
                    update(v => {
                        if (v.currentDuration + 1 > v.totalDuration) {
                            service.send({type: 'NEXT', direction: 1})
                            return v;
                        } else {
                            return {...v, currentDuration: v.currentDuration + 1}
                        }
                    })
                }, 1000);
                return () => clearInterval(interval);
            }

        }
    });
    
    // the service/ interpreted machine
    const service = interpret(machine);
    service.start();
    
    // subscribe and send, we can read and send events only
    // everything else about the implementation is hidden away, tidy!
    return {
        subscribe,
        send: (event) => service.send(event)
    }
}