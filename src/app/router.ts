import { createRouter, createWebHistory } from 'vue-router'
import BrandScene from '../brand/presentation/views/BrandScene.vue'
export default createRouter({history:createWebHistory(),routes:[{path:'/',component:BrandScene}]})
