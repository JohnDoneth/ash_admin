import "phoenix_html";
import { Socket } from "phoenix";
import topbar from "../vendor/topbar";
import { LiveSocket } from "phoenix_live_view";
import DarkModeHook from "./dark_mode"

let socketPath =
  document.querySelector("html").getAttribute("phx-socket") || "/live";
let csrfToken = document
  .querySelector("meta[name='csrf-token']")
  .getAttribute("content");
let Hooks = {};
const editors = {};

Hooks.DarkModeHook = DarkModeHook

Hooks.JsonEditor = {
  mounted() {
    const inputId = this.el.getAttribute("data-input-id");
    const hook = this;
    this.editor = new JSONEditor(
      this.el,
      {
        onChangeText: (json) => {
          const target = document.getElementById(inputId);
          try {
            JSON.parse(json);
            target.value = json;
            target.dispatchEvent(
              new Event("change", { bubbles: true, target: this.el.name }),
            );
          } catch (_e) { }
        },
        onChange: () => {
          try {
            const target = document.getElementById(inputId);
            json = hook.editor.get();

            target.value = JSON.stringify(json);
            target.dispatchEvent(
              new Event("change", { bubbles: true, target: this.el.name }),
            );
          } catch (_e) { }
        },
        onModeChange: (newMode) => {
          hook.mode = newMode;
        },
        modes: ["text", "tree"],
      },
      JSON.parse(document.getElementById(inputId).value),
    );

    editors[this.el.id] = this.editor;
  },
};

Hooks.JsonEditorSource = {
  updated() {
    try {
      let editor = editors[this.el.getAttribute("data-editor-id")];
      if (editor.getMode() === "tree") {
        editor.update(JSON.parse(this.el.value));
      } else {
        if (editor.get() !== JSON.parse(this.el.value)) {
          editor.setText(this.el.value);
        } else {
        }
      }
    } catch (_e) { }
  },
};

Hooks.JsonView = {
  updated() {
    const json = JSON.parse(this.el.getAttribute("data-json"));
    this.editor = new JSONEditor(
      this.el,
      {
        mode: "preview",
      },
      json,
    );
  },
  mounted() {
    const json = JSON.parse(this.el.getAttribute("data-json"));
    this.editor = new JSONEditor(
      this.el,
      {
        mode: "preview",
      },
      json,
    );
  },
};

const init = (element) =>
  new EasyMDE({
    element: element,
    initialValue: element.getAttribute("value"),
  });

Hooks.MarkdownEditor = {
  mounted() {
    const id = this.el.getAttribute("data-target-id");
    const el = document.getElementById(id);
    const easyMDE = init(el);
    easyMDE.codemirror.on("change", () => {
      el.value = easyMDE.value();
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  },
};

Hooks.Actor = {
  mounted() {
    this.handleEvent("set_actor", (payload) => {
      document.cookie = "actor_resource" + "=" + payload.resource + ";path=/";
      document.cookie =
        "actor_primary_key" + "=" + payload.primary_key + ";path=/";
      document.cookie = "actor_action" + "=" + payload.action + ";path=/";
      document.cookie = "actor_domain" + "=" + payload.domain + ";path=/";
      document.cookie = "actor_tenant" + "=" + payload.tenant + ";path=/";
    });
    this.handleEvent("clear_actor", () => {
      document.cookie = "actor_resource" + "=" + ";path=/";
      document.cookie = "actor_primary_key" + "=" + ";path=/";
      document.cookie = "actor_action" + "=" + ";path=/";
      document.cookie = "actor_tenant" + "=" + ";path=/";
      document.cookie = "actor_domain" + "=" + ";path=/";
      document.cookie = "actor_authorizing=false;path=/";
      document.cookie = "actor_paused=true;path=/";
    });
    this.handleEvent("toggle_authorizing", (payload) => {
      document.cookie =
        "actor_authorizing" + "=" + payload.authorizing + ";path=/";
    });
    this.handleEvent("toggle_actor_paused", (payload) => {
      document.cookie = "actor_paused" + "=" + payload.actor_paused + ";path=/";
    });
  },
};

Hooks.Tenant = {
  mounted() {
    this.handleEvent("set_tenant", (payload) => {
      document.cookie = "tenant" + "=" + payload.tenant + ";path=/";
    });
    this.handleEvent("clear_tenant", () => {
      document.cookie = "tenant" + "=" + ";path=/";
    });
  },
};

Hooks.MaintainAttrs = {
  attrs() {
    return this.el.getAttribute("data-attrs").split(", ");
  },
  beforeUpdate() {
    this.prevAttrs = this.attrs().map((name) => [
      name,
      this.el.getAttribute(name),
    ]);
  },
  updated() {
    this.prevAttrs.forEach(([name, val]) => this.el.setAttribute(name, val));
  },
};

Hooks.Typeahead = {
  mounted() {
    this.aborter = new AbortController();
    const signal = this.aborter.signal;

    const target_id = this.el.getAttribute("data-target-id");
    const target_el = document.getElementById(target_id);

    switch (this.el.tagName) {
      case "INPUT":
        this.el.addEventListener("keydown", e => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }, { signal });
        this.el.addEventListener("keyup", e => {
          switch (e.key) {
            case "Enter":
            case "Escape":
              this.el.blur();
              window.setTimeout(function () { target_el.dispatchEvent(new Event("input", { bubbles: true })) }, 750);
              break;
          }
        }, { signal });
        break;

      case "LI":
        this.el.addEventListener("click", e => {
          window.setTimeout(function () { target_el.dispatchEvent(new Event("input", { bubbles: true })) }, 750);
        }, { signal });
        break;
    }
  },
  updated() {
    if (this.el.tagName === "INPUT" && this.el.name.match(/suggest$/) && this.el.value.length === 0) {
      this.el.focus();
    }
  },
  beforeDestroy() {
    if (this.aborter) {
      this.aborter.abort();
    }
  }
};

function getCookie(name) {
  var re = new RegExp(name + "=([^;]+)");
  var value = re.exec(document.cookie);
  return value != null ? unescape(value[1]) : null;
}

let params = () => {
  return {
    _csrf_token: csrfToken,
    tenant: getCookie("tenant"),
    actor_resource: getCookie("actor_resource"),
    actor_primary_key: getCookie("actor_primary_key"),
    actor_tenant: getCookie("actor_tenant"),
    actor_action: getCookie("actor_action"),
    actor_domain: getCookie("actor_domain"),
    actor_authorizing: getCookie("actor_authorizing"),
    actor_paused: getCookie("actor_paused"),
  };
};

let liveSocket = new LiveSocket(socketPath, Socket, {
  params: params,
  hooks: Hooks,
  dom: {
    onBeforeElUpdated(from, to) {
      if (from._x_dataStack) {
        window.Alpine.clone(from, to);
      }
    },
  },
});

// Show progress bar on live navigation and form submits
topbar.config({ barColors: { 0: "#29d" }, shadowColor: "rgba(0, 0, 0, .3)" });
window.addEventListener("phx:page-loading-start", (_info) => topbar.show(300));
window.addEventListener("phx:page-loading-stop", (_info) => topbar.hide());

window.addEventListener("phx:live_reload:attached", ({ detail: reloader }) => {
  // Enable server log streaming to client. Disable with reloader.disableServerLogs()
  reloader.enableServerLogs()

  // Open configured PLUG_EDITOR at file:line of the clicked element's HEEx component
  // 
  //   VSCode: export PLUG_EDITOR="vscode://file/__FILE__:__LINE__"
  //   WSL VSCode: PLUG_EDITOR=vscode://vscode-remote/wsl+[DISTRO]__FILE__:__LINE__ replace [DISTRO]
  //
  //   * click with "c" key pressed to open at caller location
  //   * click with "d" key pressed to open at function component definition location
  let keyDown
  window.addEventListener("keydown", e => keyDown = e.key)
  window.addEventListener("keyup", e => keyDown = null)
  window.addEventListener("click", e => {
    if (keyDown === "c") {
      e.preventDefault()
      e.stopImmediatePropagation()
      reloader.openEditorAtCaller(e.target)
    } else if (keyDown === "d") {
      e.preventDefault()
      e.stopImmediatePropagation()
      reloader.openEditorAtDef(e.target)
    }
  }, true)
  window.liveReloader = reloader
})

// connect if there are any LiveViews on the page
liveSocket.connect();
// expose liveSocket on window for web console debug logs and latency simulation:
liveSocket.enableDebug();
//  liveSocket.enableLatencySim(1000)

window.liveSocket = liveSocket;
