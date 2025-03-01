import request from '@/utils/request'

export function repairList(query){
    return request({
        url:'/system/repair/list',
        method:'get',
        params:query
    })
}

export function repairStatusExamine(data){
    return request({
        url: '/system/repair/status',
        method: 'post',
        data: data
      })
}

export function getRepairOrder(repairId){
    return request({
            url:'/system/repair/list/'+ repairId,
            method:'get'
    })
}

export function handelRepairAction(data){
    return request({
        url: '/system/repair/action',
        method: 'post',
        data: data
      })
}
