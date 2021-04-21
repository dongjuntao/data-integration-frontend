import request from '@/utils/request'

export function createDataSource(data) {
  return request({
    url: '/dataSource/create',
    method: 'post',
    data: data
  })
}

export function updateDataSource(id,data) {
  return request({
    url: '/dataSource/update/'+id,
    method: 'put',
    data: data
  })
}

export function deleteDataSource(ids) {
  return request({
    url: '/dataSource/delete/' + ids,
    method: 'delete',
  })
}

export function getDataSource(id) {
  return request({
    url: '/dataSource/' + id,
    method: 'get',
  })
}
//分页
export function fetchList(params) {
  return request({
    url: '/dataSource/listDataSource',
    method: 'get',
    params: params
  })
}
//不分页
export function fetchAllList(params) {
  return request({
    url: '/dataSource/listAllDataSource',
    method: 'get',
    params: params
  })
}

export function updateStatus(id,params) {
  return request({
    url: '/dataSource/updateStatus/'+id,
    method: 'put',
    params: params
  })
}

