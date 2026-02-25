
const DEMO_DATA = [

  { id: 1, name: "Vue Fundamentals" },
  { id: 2, name: "React Basics" },
  { id: 3, name: "Advanced Vue 3" },
  { id: 4, name: "Node.js Essentials" },
];

export async function fetchSearchResults(query) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const q = (query ?? "").trim().toLowerCase();
  const filtered = q
    ? DEMO_DATA.filter((item) => item.name.toLowerCase().includes(q))
    : DEMO_DATA;
  return { data: filtered };
}
