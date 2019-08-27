export const form_config = {
  id: 'Form',
  initial: 'Idle',
  on: {
    TAB_DELETED: {
      target: 'Form.Idle',
    },
    TAB_CREATED: {
      target: 'Form.Idle',
    },
    TAB_SELECTED: {
      target: 'Form.Idle',
    },
    TAB_RENAMED: {
      target: 'Form.Idle',
    },
    TAB_VISIBILITY_TOGGLED: {
      actions: ['toggleTabVisibility'],
    },
    LABEL_CLICKED: {
      actions: ['toggleLabelTernary'],
    },
    TERM_CLICKED: {
      actions: ['toggleTermStatus'],
    },
    INDEX_CHANGED: {
      actions: ['changeIndex'],
    },
    QUERY_RESET: {
      actions: ['resetQuery'],
    },
    STORE_RESET: {
      actions: ['resetStore'],
    },
    LOGIC_TOGGLED: {
      actions: ['toggleSearchLogic'],
    },
    RULE_DISABLED: {
      actions: ['disableRule'],
    },
    RULE_COPIED: {
      actions: ['copyRule', 'selectRule'],
    },
    RULE_DELETED: {
      actions: ['deleteRule'],
    },
    LABEL_TOGGLED: {
      actions: ['toggleLabelBinary'],
    },
    LABEL_DISABLED: {
      actions: ['disableLabel'],
    },
  },
  states: {
    Idle: {
      on: {
        TEXT_CHANGED: {
          actions: ['updateCurrentRuleText'],
        },
        RULESET_CREATED: {
          actions: ['createRuleset', 'selectRule'],
        },
        RULE_SELECTED: {
          actions: ['selectRule'],
        },
        LABEL_OPTIONS_SELECTED: {
          target: 'LabelOptionsShowing',
        },
        RULE_OPTIONS_SELECTED: {
          target: 'RuleOptionsShowing',
        },
      },
    },
    LabelOptionsShowing: {
      onEntry: ['showLabelOptions'],
      on: {
        LABEL_DELETED: {
          actions: ['deleteLabel'],
          target: 'Idle',
        },
        LABEL_OPTIONS_DISMISSED: {
          target: 'Idle',
        },
      },

      onExit: ['hideLabelOptions'],
    },
    RuleOptionsShowing: {
      onEntry: ['showRuleOptions'],
      on: {
        RULE_OPTIONS_DISMISSED: {
          target: 'Idle',
        },
      },

      onExit: ['hideRuleOptions'],
    },
  },
};
