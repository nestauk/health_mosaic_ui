export const fields = {
  permutable: {
    string: [
      "name_of_organisation",
      "textBody_summary_organisation",
      "textBody_descriptive_organisation",
      "status_of_organisation",
      "type_of_organisation",
      "terms_subcategory_organisation",
      "terms_category_organisation",
      // "terms_roles_organisation",
      "placeName_country_organisation",
      "id_state_organisation",
      "placeName_region_organisation",
      "placeName_city_organisation",
      // "id_iso2_country",
      "id_iso3_country",
      "id_of_continent",
      "currency_of_funding",
    ],
    date: [
      "datetime_birth_organisation",
      "datetime_last_funding",
      "datetime_death_organisation"
    ],
    number: [
      // "id_isoNumeric_country",
      "cost_of_funding",
    ],
    coords: [
      "coordinates_of_city",
    ]
  },
  unpermutable: {
    // bool_good: [
    //   "booleanFlag_health_organization"
    // ]
  }
};
