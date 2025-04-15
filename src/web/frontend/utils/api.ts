export const getNetworks = async () => {
  try {
    const resp = await fetch(`/api/networks`);
    return await resp.json();
  } catch (e) {
    console.error("Error fetching networks", e);
    return [];
  }
};
