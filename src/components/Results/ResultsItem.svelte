<script>
  export let data;
  export let index;
</script>

<div>
  <h2><strong>{index > -1 ? `${index}: ` : ''} Name:</strong> {data.name}</h2>
  <p><strong>Terms:</strong> {data.terms}</p>
  <p>
    <strong>Location:</strong> {data.location.lon}° E, {data.location.lat}° N
  </p>
  <p><strong>Place:</strong> {data.city}, {data.state_id}, {data.country_id}</p>
  <p><strong>type:</strong> {data.type}</p>
</div>

<style>
  p,
  h2 {
    margin: 2rem;
  }
</style>
