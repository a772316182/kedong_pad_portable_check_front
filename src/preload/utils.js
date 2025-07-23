import { ipcRenderer } from 'electron'

export const PAPER_STATUS = {
  ALL: 'paperList',
  FAVORITE: 'paperFavorite',
  SOURCE: 'paperSource',
  SEARCH_HISTORY: 'paperSearchHistory'
}

export function showDialog(title, content) {
  ipcRenderer
    .invoke('show-dialog', {
      title,
      message: content
    })
    .then()
}

export async function openURL(url) {
  await ipcRenderer.invoke('open-url', url)
}

export const formatPaperList = (arr) => {
  let new_arr = []
  arr.forEach((item) => {
    let color = ''
    if (item.length > 5) {
      color = item[6]
    }
    new_arr.push({
      date: item[0],
      url: item[1],
      title: item[2],
      authors: item[3].join(', '),
      abstract: item[4],
      color: color
    })
  })
  return new_arr
}

export function uniquePapers(papers = [], key = 'url') {
  if (!papers || !Array.isArray(papers) || papers.length === 0) {
    return []
  }

  // 使用 Map 来存储每个 key 对应的最后一条 paper
  const map = new Map()

  for (const paper of papers) {
    if (paper && key in paper) {
      map.set(paper[key], paper) // 后面的会自动覆盖前面的
    }
  }

  // 最终只保留 value，并转为数组
  return Array.from(map.values())
}
