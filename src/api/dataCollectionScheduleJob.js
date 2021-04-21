import request from '@/utils/request'

export function createScheduleJob(data) {
  return request({
    url: '/dataCollectionSchedule/create',
    method: 'post',
    data: data
  })
}

export function updateScheduleJob(id,data) {
  return request({
    url: '/dataCollectionSchedule/update/'+id,
    method: 'put',
    data: data
  })
}

export function deleteScheduleJob(ids) {
  return request({
    url: '/dataCollectionSchedule/delete/' + ids,
    method: 'delete',
  })
}

export function getScheduleJob(id) {
  return request({
    url: '/dataCollectionSchedule/' + id,
    method: 'get',
  })
}
//分页
export function fetchList(params) {
  return request({
    url: '/dataCollectionSchedule/listDataCollectionScheduleJob',
    method: 'get',
    params: params
  })
}

export function updateStatus(id,params) {
  return request({
    url: '/dataCollectionSchedule/updateStatus/'+id,
    method: 'put',
    params: params
  })
}
/**定时任务立即执行*/
export function run(jobIds) {
  return request({
    url: '/dataCollectionSchedule/run/'+jobIds,
    method: 'post',
  })
}

/**定时任务暂停*/
export function pause(jobIds) {
  return request({
    url: '/dataCollectionSchedule/pause/'+jobIds,
    method: 'post',
  })
}

/**定时任务恢复*/
export function resume(jobIds) {
  return request({
    url: '/dataCollectionSchedule/resume/'+jobIds,
    method: 'post',
  })
}
