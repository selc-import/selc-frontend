<script setup lang="ts">
import BrandScene from '../../brand/presentation/views/BrandScene.vue'
import ProductCatalog from '../../catalog/presentation/views/ProductCatalog.vue'
import StorefrontNavigation from '../components/StorefrontNavigation.vue'
</script>

<template>
  <BrandScene>
    <template #navigation><StorefrontNavigation /></template>
    <template #continuation><ProductCatalog /></template>
  </BrandScene>
</template>
