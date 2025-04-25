export const getNetworks = async () => {
  try {
    const resp = await fetch(`/api/networks`);
    const { ok, data } = await resp.json();

    if (!ok) {
      throw new Error("Failed to fetch networks");
    }

    return data;
  } catch (e: any) {
    console.error("Error fetching networks", e.message);
    return [];
  }
};
