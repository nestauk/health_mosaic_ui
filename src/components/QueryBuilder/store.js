import { writable, derive } from 'svelte/store';
import { updateIndex, pipe, filterWith, updateAt } from 'lamb';
import { subjectFields, contentFields } from '../../config';
import { parseQuery } from '../../util/parse.js';

const subject = Object.keys(subjectFields).map(v => ({
  field: v,
  status: 'default',
  hovered: false,
  visible: true,
}));

const content = Object.keys(contentFields).map(v => ({
  field: v,
  status: 'default',
  hovered: false,
  visible: true,
}));

const states = {
  default: 'included',
  included: 'excluded',
  excluded: 'default',
};

const formatANDString = str =>
  str.trim()[0] === '-' //  don't even ask
    ? ` ${str //  eslint-disable-next-line
        .trim() //  eslint-disable-next-line
        .slice(1) //  eslint-disable-next-line
        .trim()}`
    : ` -${str.trim()}`;

export const search = writable({
  rules: [[]],
  value: [{ subject, content, value: '', visible: true }],
  current: 0,
});

export const rules = derive(search, search => search.value.map(parseQuery));

export function updateValue(value) {
  search.update(state => ({
    ...state,
    value: updateIndex(state.value, state.current, v => ({ ...v, value })),
  }));
}

export function setRuleVisibility(index) {
  search.update(state => ({
    ...state,
    value: updateIndex(state.value, index, v => ({
      ...v,
      visible: !v.visible,
    })),
  }));
}

export function removeRule(index) {
  search.update(state => {
    const tempValues = state.value.filter((v, i) => i !== index);
    let current;

    if (state.current === 0) {
      current = 0;
    } else {
      current =
        state.current === tempValues.length
          ? tempValues.length - 1
          : state.current;
    }

    return {
      ...state,
      value:
        tempValues.length === 0
          ? [{ subject, content, value: '', visible: true }]
          : tempValues,
      current,
    };
  });
}

export function removeQueryLabel(index, jindex) {
  search.update(state => {
    const splitFilter = s =>
      s
        .split(',')
        .filter((v, j) => j !== jindex)
        .join(',');

    return {
      ...state,
      current: state.value[state.current].value
        ? state.current
        : state.value.length,
      value: pipe([
        updateAt(index, v => ({
          ...v,
          value: splitFilter(v.value),
        })),
        filterWith(v => v.value),
        updateAt(state.current, v =>
          state.value[state.current].value ? v : { ...v, value: '' }
        ),
      ])(state.value),
    };
  });
}

export function selectRule(index) {
  search.update(state => ({
    ...state,
    current: index,
  }));
}

export function newRule() {
  search.update(state => {
    if (state.value[state.current].value.trim() === '') return state;
    return {
      ...state,
      current: state.current + 1,
      value: state.value.concat({ subject, content, value: '', visible: true }),
    };
  });
}

export function copyRule(index) {
  search.update(state => ({
    ...state,
    current: state.current + 1,
    value: state.value.concat(state.value[index]),
  }));
}

export function negateValueClick(vIndex, qIndex) {
  search.update(state => {
    return {
      ...state,
      value: updateIndex(state.value, vIndex, v => ({
        ...v,
        value: pipe([
          s => s.split(','),
          updateAt(qIndex, q => formatANDString(q)),
          a => a.join(','),
        ])(v.value),
      })),
    };
  });
}

export function handleSelect(obj, index, status) {
  search.update(state => ({
    ...state,
    value: updateIndex(state.value, state.current, v => ({
      ...v,
      [obj]: updateIndex(v[obj], index, f => ({
        ...f,
        status: status ? status : states[f.status],
      })),
    })),
  }));
}

export function updateStatus(obj, index, jindex, status) {
  search.update(state => ({
    ...state,
    value: updateIndex(state.value, index || state.current, v => ({
      ...v,
      [obj]: updateIndex(v[obj], jindex, f => ({
        ...f,
        status: status ? status : states[f.status],
      })),
    })),
  }));
}

export function updateVisibility(obj, index, jindex) {
  search.update(state => ({
    ...state,
    value: updateIndex(state.value, index || state.current, v => ({
      ...v,
      [obj]: updateIndex(v[obj], jindex, f => ({
        ...f,
        visible: !f.visible,
      })),
    })),
  }));
}