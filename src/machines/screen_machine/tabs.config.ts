export const tabs_config = {
  id: 'Tabs',
  initial: 'Idle',
  states: {
    Idle: {
      on: {
        TAB_DELETED: {
          actions: ['deleteTab', 'setUrlQuery'],
        },
        TAB_CREATED: {
          actions: [
            'createTab',
            'setCurrentTab',
            'createSearchMachine',
            'pushHistory',
            'setUrlQuery',
          ],
        },
        TAB_RESTORED: {
          actions: ['restoreTab', 'createSearchMachine'],
        },
        TAB_SELECTED: {
          actions: ['setCurrentTab', 'pushHistory', 'setUrlQuery'],
        },
        TAB_RENAMED: {
          actions: ['setTabLabel'],
        },
      },
    },
  },
};
