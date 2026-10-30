<template>
  <article class="product-card">
    <div class="product-image" aria-hidden="true">{{ product.name.slice(0, 1) }}</div>
    <div>
      <p class="eyebrow">{{ product.category }}</p>
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <div class="product-footer">
        <strong>{{ currency.format(product.price) }}</strong>
        <button class="button" type="button" @click="$emit('add', product)">Add to cart</button>
      </div>
    </div>
  </article>
</template>

<script setup>
defineProps({ product: { type: Object, required: true } });
defineEmits(['add']);
const currency = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' });
</script>
