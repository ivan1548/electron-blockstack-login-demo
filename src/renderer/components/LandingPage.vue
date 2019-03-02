<template>
  <main>
    <div v-if="profile" class="profile">
      <img class="avatar" :src="avatar">
      <h2>{{ profile.name() }}</h2>
    </div>

    <button v-if="profile" class="button" @click="signOut()">sign out</button>
    <button v-else class="button" @click="signIn()">sign in with blockstack</button>
  </main>
</template>

<script>
import { UserSession, AppConfig, Person } from 'blockstack';

import { ipcRenderer } from 'electron';

export default {
  name: 'LandingPage',
  components: {},
  data() {
    return {
      profile: false
    };
  },
  computed: {
    avatar() {
      return (
        this.profile.avatarUrl() ||
        'https://s3.amazonaws.com/onename/avatar-placeholder.png'
      );
    }
  },
  created() {
    const appDomain = 'http://localhost:9876';
    const appConfig = new AppConfig(
      ['store_write'],
      appDomain,
      '/callback',
      '/manifest.json'
    );
    this.userSession = new UserSession({ appConfig });

    if (this.userSession.isUserSignedIn()) {
      this.profile = new Person(this.userSession.loadUserData().profile);
    } else if (
      !this.userSession.isUserSignedIn() &&
      this.userSession.isSignInPending()
    ) {
      this.userSession.handlePendingSignIn().then(userData => {
        this.profile = new Person(userData.profile);
      });
    }

    ipcRenderer.on('signInDone', (event, authResponse) => {
      this.userSession.handlePendingSignIn(authResponse).then(userData => {
        this.profile = new Person(userData.profile);
      });
    });
  },
  methods: {
    signIn() {
      this.userSession.redirectToSignIn();
    },
    signOut() {
      this.userSession.signUserOut();
      this.profile = false;
    }
  }
};
</script>
<style lang="scss">
main {
  position: fixed;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
.profile {
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
}
.button {
  border: none;
  background-color: #5aa4c4;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 18px;
  font-weight: 600;
  width: 100%;
  padding: 16px 30px;
  text-decoration: none;
  border: none;
  transition: background-color 300ms;
}
.button:hover {
  background-color: #45a0c7;
}
.button:active {
  position: relative;
  top: 1px;
}
button:focus {
  outline: none;
}
</style>
