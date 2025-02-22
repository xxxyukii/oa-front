import request from '@/utils/request'

  //查询会议室列表信息
  export function listMeetingRoom(query){
    return request({
      url: '/system/meeting/room/list',
      method: 'get',
      params: query
    })
  }

// 查询指定会议室详细信息
export function getMeetingRoom(roomId) {
  return request({
    url: '/system/meeting/' + roomId,
      method: 'get',

  })
}



//会议室名称
export function getRoomNamelist(query){
  return request({
    url:'/system/meeting/roomnamelist',
    method:'get',
    params:query
  })
}

  // 新增会议室
export function addMeetingRoom(data) {
    return request({
      url: '/system/meeting/add',
      method: 'post',
      data: data
    })
  }

  // 修改会议室
export function updateMeetingRoom(data) {
  return request({
    url: '/system/meeting',
    method: 'put',
    data: data
  })
}
//删除会议室
export function delMeetingRoom(roomIds) {
  return request({
    url: '/system/meeting/' + roomIds,
    method: 'delete'
  })

}
// 用户状态修改
export function changeRoomInUse(roomId, inUse) {
  const data = {
    roomId,
    inUse
  }
  return request({
    url: '/system/meeting/changeInUse',
    method: 'put',
    data: data
  })
}



  // 会议室图片上传
export function uploadImage(data) {
  return request({
    url: '/system/meeting/upload/image',
    method: 'post',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: data
  })
}

