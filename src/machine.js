

// This is just an object, basically an xstate config object.
export const mediaMachine = {
    id: 'mediaPlayer',
    type: 'parallel',
    states: {
        player: {
            initial: 'stopped',
            states: {
                stopped: {
                    onEntry: 'setPlayState',
                    on: {
                        PLAY: 'playing',
                    },
                },
                playing: {
                    onEntry: 'setPlayState',
                    activities: ['incr'],
                    on: {
                        PAUSE: 'paused',
                        STOP: 'stopped',
                    }
                },
                paused: {
                    onEntry: 'setPlayState',
                    on: {
                        PLAY: 'playing',
                        STOP: 'stopped',
                    },
                }
            },
        },
        seek: {
            id: 'seek',
            initial: 'idle',
            on: {
                SEEK: 'seek.seeking'
            },
            states: {
                idle: {},
                seeking: {
                    onEntry: 'seek',
                    on: {
                        SEEKEND: 'idle',
                    }
                }
            }
        },
        trackManager: {
            initial: 'idle',
            states: {
                idle: {
                    on: {
                        CHANGETRACK: 'resolving'
                    }   
                },
                resolving: {
                    onEntry: 'change',
                    on: {
                        RESOLVE: 'idle',
                        REJECT: 'error'
                    }
                },
                error: {
                    onEntry: 'throwError',
                    on: {
                        RETRY: 'resolving',
                        ABORT: 'idle'
                    }
                },  
            }
        }
    }
};
    
    


  

  

  


