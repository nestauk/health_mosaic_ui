import { aggregationQuery } from '../../actions/queryApi';

export const explore_options: any = {
  actions: {
    updateData: ({ aggregationStore }, { data: { results } }) => {
      const data = results.data.Aggregation.map(({ name, buckets }) => ({
        key: name,
        buckets,
      }));
      aggregationStore.set(data);
    },
  },
  services: {
    apiRequest: ({}, { aggregations }) => {
      return aggregationQuery(aggregations);
    },
  },
};
