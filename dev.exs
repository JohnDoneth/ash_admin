# Copied/edited from phoenix_live_dashboard
# Configures the endpoint
Application.put_env(:ash_admin, DemoWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "Hu4qQN3iKzTV4fJxhorPQlA/osH9fAMtbtjVS58PFgfw3ja5Z18Q/WSNR9wP4OfW",
  live_view: [signing_salt: "hMegieSe"],
  http: [port: System.get_env("PORT") || 4000],
  debug_errors: true,
  check_origin: false,
  pubsub_server: Demo.PubSub,
  watchers: [
    esbuild: {Esbuild, :install_and_run, [:default, ~w(--watch)]},
    tailwind: {Tailwind, :install_and_run, [:default, ~w(--watch)]}
  ],
  live_reload: [
    notify: [
      live_view: [
        ~r"./lib/ash_admin/web.ex$",
        ~r"lib/ash_admin/components/resource/.*(ex)",
        ~r"lib/ash_admin/components/top_nav.ex$",
        ~r"lib/ash_admin/components/top_nav/.*(ex)"
      ]
    ],
    patterns: [
      ~r"priv/static/(?!uploads/).*(js|css|png|jpeg|jpg|gif|svg)$",
      ~r"lib/ash_admin/pages/.*(ex)$",
      ~r"lib/ash_admin/components/core_components.ex$",
      ~r"lib/ash_admin/components/resource/.*(ex)",
      ~r"lib/ash_admin/components/top_nav.ex$",
      ~r"lib/ash_admin/components/top_nav/.*(ex)"
    ]
  ]
)

defmodule DemoWeb.Router do
  use Phoenix.Router

  pipeline :browser do
    plug :fetch_session
    plug :fetch_query_params
  end

  scope "/" do
    pipe_through :browser
    import AshAdmin.Router

    ash_admin("/")
  end
end

defmodule DemoWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :ash_admin

  socket "/live", Phoenix.LiveView.Socket
  socket "/phoenix/live_reload/socket", Phoenix.LiveReloader.Socket

  plug Phoenix.CodeReloader
  plug Phoenix.LiveReloader

  plug Plug.Session,
    store: :cookie,
    key: "_live_view_key",
    signing_salt: "/VEDsdfsffMnp5"

  plug Plug.RequestId
  plug DemoWeb.Router
end

Application.ensure_all_started(:os_mon)
Application.put_env(:phoenix, :serve_endpoints, true)
  :erlang.system_flag(:backtrace_depth, 100)

Task.start(fn ->
  children = [
    Demo.Repo,
    DemoWeb.Endpoint,
    {Phoenix.PubSub, [name: Demo.PubSub, adapter: Phoenix.PubSub.PG2]},
  ]

  {:ok, _} = Supervisor.start_link(children, strategy: :one_for_one)
  Process.sleep(:infinity)
end)
