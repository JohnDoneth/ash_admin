defmodule AshAdmin.Components.Resource.MetadataTable do
  @moduledoc false
  use Phoenix.Component
  import AshAdmin.Helpers

  alias AshAdmin.CoreComponents

  attr :resource, :any, required: true

  def attribute_table(assigns) do
    ~H"""
    <div :if={Enum.any?(attributes(@resource))}>
      <CoreComponents.page_title class="mb-4">Attributes</CoreComponents.page_title>
      <CoreComponents.table id="attributes" rows={attributes(@resource)}>
        <:col :let={attribute} label="Name">
          <p title={attribute.description} class="font-mono">{attribute.name}</p>
        </:col>
        <:col :let={attribute} label="Type">
          <p class="font-mono">
            {attribute_type(attribute)}
          </p>
        </:col>
        <%!-- <:col :let={attribute} label="Description">
          <p title={attribute.description}>{attribute.description}</p>
        </:col> --%>
        <:col :let={attribute} label="Primary Key" class="text-center">
          <.checkmark value={attribute.primary_key?} />
        </:col>
        <:col :let={attribute} label="Private" class="text-center">
          <.checkmark value={attribute.public?} />
        </:col>
        <:col :let={attribute} label="Allow Nil" class="text-center">
          <.checkmark value={attribute.allow_nil?} />
        </:col>
        <:col :let={attribute} label="Writable" class="text-center">
          <.checkmark value={attribute.writable?} />
        </:col>
      </CoreComponents.table>
    </div>
    """
  end

  def checkmark(assigns) do
    ~H"""
    <div class="flex justify-around">
      <CoreComponents.icon
        name={if @value, do: "hero-check", else: "hero-x-mark"}
        class={[
          "stroke-4 h-5 w-5",
          if(@value, do: "text-green-600 dark:text-green-400", else: "text-brand/70")
        ]}
      />
    </div>
    """
  end

  attr :resource, :any, required: true
  attr :domain, :any, required: true
  attr :prefix, :any, required: true

  def relationship_table(assigns) do
    ~H"""
    <div :if={Enum.any?(relationships(@resource))} class="w-full">
      <CoreComponents.page_title class="mt-12 mb-4">Relationships</CoreComponents.page_title>
      <CoreComponents.table id="attributes" rows={relationships(@resource)}>
        <:col :let={relationship} label="Name" scope="row">
          <p class="font-mono">
            {relationship.name}
          </p>
        </:col>
        <:col :let={relationship} label="Type">
          <p class="font-mono">
            {relationship.type}
          </p>
        </:col>
        <:col :let={relationship} label="Destination">
          <.link
            class="font-mono"
            navigate={"#{@prefix}?domain=#{AshAdmin.Domain.name(relationship.domain || Ash.Resource.Info.domain(relationship.destination) || @domain)}&resource=#{AshAdmin.Resource.name(relationship.destination)}"}
          >
            {AshAdmin.Resource.name(relationship.destination)}
          </.link>
        </:col>
        <:col :let={relationship} label="Description">
          {relationship.description || "-"}
        </:col>
      </CoreComponents.table>
    </div>
    """
  end

  slot :inner_block

  def h1(assigns) do
    ~H"""
    <h1 class="text-3xl rounded-t pt-8">
      {render_slot(@inner_block)}
    </h1>
    """
  end

  slot :inner_block

  def table(assigns) do
    ~H"""
    <table class="table-auto w-full">
      {render_slot(@inner_block)}
    </table>
    """
  end

  attr :scope, :string, default: "col"
  slot :inner_block

  def th(assigns) do
    ~H"""
    <th scope={@scope} class="px-2 py-3 text-left text-sm font-semibold text-gray-900">
      {render_slot(@inner_block)}
    </th>
    """
  end

  attr :class, :string, default: ""
  slot :inner_block

  def td(assigns) do
    ~H"""
    <td class={classes(["px-2 py-3 text-left text-sm text-gray-900", @class])}>
      {render_slot(@inner_block)}
    </td>
    """
  end

  defp attributes(resource) do
    resource
    |> Ash.Resource.Info.attributes()
    |> Enum.sort_by(&(not &1.public?))
  end

  defp attribute_type(attribute) do
    case attribute.type do
      {:array, type} ->
        "list of " <> String.trim_leading(inspect(type), "Ash.Type.")

      type ->
        String.trim_leading(inspect(type), "Ash.Type.")
    end
  end

  defp relationships(resource) do
    resource
    |> Ash.Resource.Info.relationships()
    |> Enum.sort_by(&(not &1.public?))
  end
end
