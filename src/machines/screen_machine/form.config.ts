export const form_config = {
  id: 'Form',
  initial: 'Simple',
  on: {
    TAB_CREATED: {
      target: 'Form.Simple',
    },
    TAB_DELETED: [
      { target: 'Form.Complex', cond: 'isComplex' },
      { target: 'Form.Simple' },
    ],
    TAB_SELECTED: [
      { target: 'Form.Complex', cond: 'isComplex' },
      { target: 'Form.Simple' },
    ],
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
    TEXT_CHANGED: {
      actions: ['updateCurrentRuleText'],
    },
    RULE_SELECTED: {
      actions: ['selectRule'],
    },
    RULE_EDITED: {
      actions: ['editRuleset'],
    },
  },
  states: {
    Simple: {
      on: {
        CHANGE_SEARCH_COMPLEX: {
          target: 'Complex',
        },
      },
    },
    Complex: {
      on: {
        CHANGE_SEARCH_SIMPLE: {
          target: 'Simple',
          actions: ['activateSimpleSearch'],
        },
        LABEL_CLICKED: {
          actions: ['toggleLabelTernary'],
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
        LABEL_DELETED: {
          actions: ['deleteLabel'],
        },
        RULESET_CREATED: {
          actions: ['createRuleset', 'selectRule'],
        },
      },
    },
  },
};
