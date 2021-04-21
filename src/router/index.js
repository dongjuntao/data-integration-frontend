import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
 * hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
 *                                if not set alwaysShow, only more than one route under the children
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
 **/
export const constantRouterMap = [
  {path: '/login', component: () => import('@/views/login/index'), hidden: true},
  {path: '/404', component: () => import('@/views/404'), hidden: true},
  {
    path: '',
    component: Layout,
    redirect: '/home',
    children: [{
      path: 'home',
      name: 'home',
      component: () => import('@/views/home/index'),
      meta: {title: '首页', icon: 'home'}
    }]
  }
]

export const asyncRouterMap = [
  /**系统管理*/
  {
    path:'/sys',
    component: Layout,
    redirect: '/sys/admin',
    name: 'sys',
    meta: {title: '系统管理', icon: 'sys'},
    children: [
      /**用户管理*/
      {
        path: 'admin',
        name: 'admin',
        component: () => import('@/views/sys/admin/index'),
        meta: {title: '用户管理', icon: 'sys-admin'}
      },
      /**角色管理*/
      {
        path: 'role',
        name: 'role',
        component: () => import('@/views/sys/role/index'),
        meta: {title: '角色管理', icon: 'sys-role'}
      },
      {
        path: 'allocMenu',
        name: 'allocMenu',
        component: () => import('@/views/sys/role/allocMenu'),
        meta: {title: '分配菜单'},
        hidden: true
      },
      /**菜单管理*/
      {
        path: 'menu',
        name: 'menu',
        component: () => import('@/views/sys/menu/index'),
        meta: {title: '菜单管理', icon: 'sys-menu'}
      },
      {
        path: 'addMenu',
        name: 'addMenu',
        component: () => import('@/views/sys/menu/add'),
        meta: {title: '添加菜单'},
        hidden: true
      },
      {
        path: 'updateMenu',
        name: 'updateMenu',
        component: () => import('@/views/sys/menu/update'),
        meta: {title: '修改菜单'},
        hidden: true
      },
      /**管理员登录日志*/
      {
        path: 'adminLog',
        name: 'adminLog',
        component: () => import('@/views/sys/adminLog'),
        meta: {title: '登录日志', icon: 'sys-admin-log'},
      },
    ]
  },
  /**数据采集管理*/
  {
    path: '/dataCollection',
    component: Layout,
    redirect: '/dataCollection/dataSource',
    name: 'dataCollection',
    meta: {title: '数据采集管理', icon: 'data-collection'},
    children: [
      /**数据源管理*/
      {
        path: 'dataSource',
        name: 'dataSource',
        component: () => import('@/views/dataCollection/dataSource/index'),
        meta: {title: '数据源管理', icon: 'data-source'},
      },
      /**采集任务管理*/
      {
        path: 'collectionTask',
        name: 'collectionTask',
        component: () => import('@/views/dataCollection/collectionTask/index'),
        meta: {title: '采集任务管理', icon: 'collection-task'},
      },
      /**定时任务*/
      {
        path: 'scheduleJob',
        name: 'scheduleJob',
        component: () => import('@/views/dataCollection/scheduleJob/index'),
        meta: {title: '定时任务', icon: 'schedule-job'},
      }
    ]
  },
  {path: '*', redirect: '/404', hidden: true}
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})

