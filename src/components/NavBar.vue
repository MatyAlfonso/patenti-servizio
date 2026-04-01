<template>
  <nav class="navbar">
    <div class="navbar-left">
      <img src="/logo.png" alt="Logo" class="navbar-logo" />
      <span class="navbar-brand">Patenti di servizio PCR/CFR</span>
    </div>

    <ul class="navbar-links">
      <li>
        <router-link to="/richieste">Richieste</router-link>
      </li>
      <li>
        <router-link to="/patenti">Patenti</router-link>
      </li>
      <li>
        <router-link to="/anagrafica_personale">Anagrafica del personale</router-link>
      </li>
      <li>
        <router-link to="/anagrafica_enti">Anagrafica degli enti</router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0067b1;
  padding: 0 3rem;
  height: 90px;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar-logo {
  height: 70px;
  width: auto;
  object-fit: contain;
}

.navbar-brand {
  font-weight: 800;
  font-size: 1.8rem;
  letter-spacing: -0.5px;
}

.navbar-links {
  display: flex;
  list-style: none;
  gap: 35px;
}

.navbar-links a {
  color: #fff;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 8px 4px;

  &:hover {
    color: #ff5900;
  }
}

.router-link-active {
  border-bottom: 4px solid #ff5900;
  font-weight: bold;
}

.item {
  display: inline-block;
  white-space: nowrap;
}
</style>