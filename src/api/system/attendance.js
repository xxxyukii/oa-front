import request from '@/utils/request'



// 新增实时打卡记录
export function addCheck() {
  return request({
    url: '/system/attendance',
    method: 'post',
  })
}

// 查询考勤列表
// 接收一个 query 对象，作为请求的查询参数
export function attendanceAllList(query) {
  return request({
    url: '/system/attendance/list',
    method: 'get',
    params: query

    
  })
}

// 根据考勤attId获取详细信息
export function getAttendance(attId) {
  return request({
    url: '/system/attendance/list/' + attId,
    method: 'get'
  })
}


// 修改考勤记录
export function updateAttendance(data) {
  return request({
    url: '/system/attendance',
    method: 'put',
    data: data
  })
}

export function formatAmTime(time) {
  if (!time) return '';  // 处理空值
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');  // 格式化为 'YYYY-MM-DD HH:mm:ss'
}