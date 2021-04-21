import request from '@/utils/request'

export function isConnected(data) {
  return request({
    url: '/mysql/test',
    method: 'post',
    data: data
  })
}
/**根据库相关信息获取该库下所有表结构信息*/
export function getTableField(data) {
  return request({
    url: '/mysql/getTableField',
    method: 'post',
    data: data
  })
}

/**根据库相关信息获取该库下所有表结构信息*/
export function getTableList(data) {
  return request({
    url: '/mysql/getTableList',
    method: 'post',
    data: data
  })
}

/**根据库相关信息获取该库下所有表结构信息*/
export function getFieldListByTableName(tableName,data) {
  return request({
    url: '/mysql/getFieldList/'+tableName,
    method: 'post',
    data: data
  })
}

