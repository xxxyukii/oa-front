import request from '@/utils/request'

// 全ての資産管理リストを取得
export function assetsList(query){
    return request ({
        url:'/system/assets/list',
        method:'get',
        params:query

    })
}
//获取资产详细信息
export function getAsset(assetId) {
    return request({
      url: '/system/assets/list/' + assetId,
      method: 'get'
    })
  }
//获取指定员工的资产信息
export function getUserAsset(query){
  return request({
    url: '/system/assets/listByUser',
    method: 'get',
    params:query

  })
}

// 変更资产信息
export function updateAsset(data){
    return request({
        url: '/system/assets',
        method: 'put',
        data: data

    })
}
//变更资产数量
export function updateQuantity(data){
  return request({
    url: '/system/assets/reduceQuantity',
    method: 'put',
    data: data
  })
}

//变更/新增 维修单
export function addReapair(data){
  return request({
    url: '/system/assets/addReapair',
    method: 'post',
    data: data
})
}
//新增
export function addAsset(data){
    return request({
      url: '/system/assets/add',
      method: 'post',
      data: data
    })
}
//删除
export function delAsset(assetIds){
  return request({
    url: '/system/assets/' + assetIds,
    method: 'delete'
  })
}
//维修上传图片
export function uploadFiles(data){
    return request({
      url: '/system/assets/upload',
      method: 'post',
      data: data,
      headers: { "Content-Type": "multipart/form-data" }
    })      
}

