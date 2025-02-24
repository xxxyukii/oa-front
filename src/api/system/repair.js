import request from '@/utils/request'

export function repairList(query){
    return request({
        url:'/system/repair/list',
        method:'get',
        params:query
    })
}