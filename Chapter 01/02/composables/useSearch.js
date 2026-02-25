import { ref, onMounted, watch } from 'vue'
import { fetchSearchResults } from '../services/fetchSearchResults'

export  function useSearch(query) {
  const results = ref([])
  const loading = ref(false)

  const fetchResults = async () => {
    loading.value = true
    const response = await fetchSearchResults(query.value)
    results.value = response.data
    loading.value = false
  }

  onMounted(fetchResults)
  watch(query, fetchResults)

  return { results, loading }
}
