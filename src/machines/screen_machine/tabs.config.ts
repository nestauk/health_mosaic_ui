export const tabs_config = {
  id: 'Tabs',
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        TAB_COPIED: {
          actions: ['duplicateTabs', 'setUrlQuery'],
        },
        TAB_DELETED: {
          actions: ['deleteTab', 'setUrlQuery'],
        },
        TAB_CREATED: {
          actions: [
            'createTab',
            'setCurrentTab',
            'pushHistory',
            'setUrlQuery',
            'incrementId'
          ],
          target: '#Tabs.Spawning'
        },
        TAB_RESTORED: {
          actions: ['restoreTab', 'createSearchMachine'],
        },
        TAB_SELECTED: {
          actions: ['setCurrentTab', 'pushHistory', 'setUrlQuery'],
        },
        TAB_RENAMED: {
          actions: ['setTabLabel', 'setUrlQuery'],
        },
      },
    },
    Spawning: {
      onEntry: ['createSearchMachine'],
      on: {
        '': '#Tabs.Idle'
      }
    }
  },
};
