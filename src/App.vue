<script setup>
const handleMicrophone = () => {
  alert("open microphone");
};
</script>

<template>
  <main>
    <input type="text" />

    <button @click="handleMicrophone">enable microphone</button>
  </main>
</template>

<style scoped></style>
