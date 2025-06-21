// Modified from https://github.com/aiwaiwa/phoenix_dark_mode (MIT License)
const localStorageKey = 'theme';

const isDark = () => {
    if (localStorage.getItem(localStorageKey) === 'dark') return true;
    if (localStorage.getItem(localStorageKey) === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

const toggleVisibility = (dark) => {
    if (dark) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
    try { localStorage.setItem(localStorageKey, dark ? 'dark' : 'light') } catch (_err) { }


}


const darkModeHook = {
    toggleButtons(dark) {
        this.el.querySelectorAll('[data-light-icon]').forEach((el) => {
            if (!dark) {
                el.classList.remove('hidden')
            } else {
                el.classList.add('hidden')
            }
        });

        this.el.querySelectorAll('[data-dark-icon]').forEach((el) => {
            if (dark) {
                el.classList.remove('hidden')
            } else {
                el.classList.add('hidden')
            }
        });
    },
    mounted() {
        this.toggleButtons(!isDark());

        this.el.addEventListener('click', () => {
            toggleVisibility(!isDark());

            this.toggleButtons(!isDark());
        });
    }
}

export default darkModeHook;