import { writable, derive } from 'svelte/store';
import { updateIndex, pipe, filterWith, updateAt } from 'lamb';
import { subjectFields, contentFields } from '../../config';
import { parseQuery } from '../../util/parse.ts';

export const createStore = queries => {
  const subject = Object.keys(subjectFields.NIH).map(v => ({
    field: v,
    status: 'default',
    hovered: false,
    visible: true,
  }));

  const content = Object.keys(contentFields.NIH).map(v => ({
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

  const search = writable(
    queries || {
      rules: [[]],
      value: [{ subject, content, value: '', visible: true }],
      current: 0,
    }
  );

  const rules = derive(search, search => search.value.map(parseQuery));

  function updateValue(value) {
    search.update(state => ({
      ...state,
      value: updateIndex(state.value, state.current, v => ({ ...v, value })),
    }));
  }

  function setRuleVisibility(index) {
    search.update(state => ({
      ...state,
      value: updateIndex(state.value, index, v => ({
        ...v,
        visible: !v.visible,
      })),
    }));
  }

  function removeRule(index) {
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

  function removeQueryLabel(index, jindex) {
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

  function selectRule(index) {
    search.update(state => ({
      ...state,
      current: index,
    }));
  }

  function newRule() {
    search.update(state => {
      if (state.value[state.current].value.trim() === '') return state;
      return {
        ...state,
        current: state.current + 1,
        value: state.value.concat({
          subject,
          content,
          value: '',
          visible: true,
        }),
      };
    });
  }

  function copyRule(index) {
    search.update(state => ({
      ...state,
      current: state.current + 1,
      value: state.value.concat(state.value[index]),
    }));
  }

  function negateValueClick(vIndex, qIndex) {
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

  function handleSelect(obj, index, status) {
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

  function updateStatus(obj, index, jindex, status) {
    search.update(state => ({
      ...state,
      value: updateIndex(
        state.value,
        index === undefined ? state.current : index,
        v => ({
          ...v,
          [obj]: updateIndex(v[obj], jindex, f => ({
            ...f,
            status: status ? status : states[f.status],
          })),
        })
      ),
    }));
  }

  function updateVisibility(obj, index, jindex) {
    search.update(state => ({
      ...state,
      value: updateIndex(
        state.value,
        index === undefined ? state.current : index,
        v => ({
          ...v,
          [obj]: updateIndex(v[obj], jindex, f => ({
            ...f,
            visible: !f.visible,
          })),
        })
      ),
    }));
  }

  return {
    search: {
      subscribe: search.subscribe,
      updateVisibility,
      updateStatus,
      handleSelect,
      negateValueClick,
      copyRule,
      newRule,
      selectRule,
      removeQueryLabel,
      removeRule,
      setRuleVisibility,
      updateValue,
    },
    rules,
  };
};
