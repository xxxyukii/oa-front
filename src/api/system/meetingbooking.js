import request from '@/utils/request'


//查询所有会议信息
export function listBooking(query){
  return request({
      url: '/system/meeting/booking/list',
      method:'get',
      params: query
  })
}

// 新增会议室预约
export function addBooking(query) {
    return request({
      url: '/system/meeting/booking/add',
      method: 'post',
      data: query
    })
  }

  //获取用户信息
  export function getUsers(query){
    return request({
      url: '/system/user/list',
      method: 'get',
      params: query
  })
  }
  // 指定时间段可用的会议室
  export function getAvailableRooms(query){
    return request({
         url: '/system/meeting/room/available',
        method: 'get',
        params: query
    })
  }

  // 删除会议记录
export function delBooking(bookingId) {
  return request({
    url: '/system/meeting/booking/' + bookingId,
    method: 'delete'
  })
}

//会议审核
export function requestStatus(data){
    return request({
      url: '/system/meeting/booking/status',
      method: 'post',
      data: data
    })
}
