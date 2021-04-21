import request from '@/utils/request'

export function createDataCollectionTask(data) {
  return request({
    url: '/dataCollectionTask/create',
    method: 'post',
    data: data
  })
}

export function updateDataCollectionTask(id,data) {
  return request({
    url: '/dataCollectionTask/update/'+id,
    method: 'put',
    data: data
  })
}

export function deleteDataCollectionTask(ids) {
  return request({
    url: '/dataCollectionTask/delete/' + ids,
    method: 'delete',
  })
}

export function getDataCollectionTask(id) {
  return request({
    url: '/dataCollectionTask/' + id,
    method: 'get',
  })
}

export function fetchList(params) {
  return request({
    url: '/dataCollectionTask/listDataCollectionTask',
    method: 'get',
    params: params
  })
}

//不分页
export function fetchAllTaskList(params) {
  return request({
    url: '/dataCollectionTask/listAllDataCollectionTask',
    method: 'get',
    params: params
  })
}

export function updateStatus(id,params) {
  return request({
    url: '/dataCollectionTask/updateStatus/'+id,
    method: 'put',
    params: params
  })
}


