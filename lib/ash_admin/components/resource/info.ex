defmodule AshAdmin.Components.Resource.Info do
  @moduledoc false
  use Phoenix.Component

  alias AshAdmin.Components.Resource.MetadataTable

  import AshAdmin.CoreComponents

  attr :resource, :any, required: true
  attr :domain, :any, required: true
  attr :prefix, :any, required: true

  def info(assigns) do
    ~H"""
    <.card class="m-8 p-8">
      <div class="overflow-x-auto overflow-y-hidden ">
        <MetadataTable.attribute_table resource={@resource} />
        <MetadataTable.relationship_table domain={@domain} resource={@resource} prefix={@prefix} />
      </div>
    </.card>
    """
  end
end
