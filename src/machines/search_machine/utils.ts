export const matchesDirty = searchMachine =>
  searchMachine &&
  searchMachine.state.matches('Search.NotEmpty.Dirty');

export const matchesError = searchMachine =>
  searchMachine &&
  searchMachine.state.matches('Search.NotEmpty.Dirty.Error');

export const matchesPending = searchMachine =>
  searchMachine &&
  searchMachine.state.matches('Search.NotEmpty.Dirty.Pending');

export const matchesMatching = searchMachine =>
  searchMachine &&
  searchMachine.state.matches('Search.NotEmpty.Matching');
