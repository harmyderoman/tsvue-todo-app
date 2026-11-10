import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import ToDoItem from "@/components/ToDoItem.vue"
import type ToDo from "@/models/ToDoModel"

const mountTodo = (todo: Partial<ToDo> = {}) =>
  mount(ToDoItem, {
    props: { todo: { text: "Buy milk", completed: false, ...todo } }
  })

const buttonByText = (wrapper: ReturnType<typeof mountTodo>, text: string) =>
  wrapper.findAll("button").find((button) => button.text() === text)!

describe("ToDoItem", () => {
  it("shows the todo text", () => {
    const wrapper = mountTodo()

    expect(wrapper.find(".todo__text").text()).toBe("Buy milk")
  })

  it("shows a placeholder for an empty todo", () => {
    const wrapper = mountTodo({ text: "" })

    expect(wrapper.find(".todo__text").text()).toBe("Click to edit Todo")
  })

  it("strikes through a completed todo and ticks its checkbox", () => {
    const wrapper = mountTodo({ completed: true })

    expect(wrapper.find(".todo__text").classes()).toContain("completed")
    expect(wrapper.find<HTMLInputElement>(".check").element.checked).toBe(true)
  })

  it("does not strike through an empty completed todo", () => {
    const wrapper = mountTodo({ text: "", completed: true })

    expect(wrapper.find(".todo__text").classes()).not.toContain("completed")
  })

  it("emits checkbox-click with the new state", async () => {
    const wrapper = mountTodo()

    await wrapper.find(".check").setValue(true)

    expect(wrapper.emitted("checkbox-click")).toEqual([[true]])
  })

  it("turns into an input on click and emits update-todo while typing", async () => {
    const wrapper = mountTodo()

    await wrapper.find(".todo__text").trigger("click")
    const input = wrapper.find<HTMLInputElement>(".todo__input")
    expect(input.element.value).toBe("Buy milk")

    await input.setValue("Buy oat milk")
    expect(wrapper.emitted("update-todo")).toEqual([["Buy oat milk"]])
  })

  it("toggles editing with the Edit / Save button", async () => {
    const wrapper = mountTodo()

    await buttonByText(wrapper, "Edit").trigger("click")
    expect(wrapper.find(".todo__input").exists()).toBe(true)

    await buttonByText(wrapper, "Save").trigger("click")
    expect(wrapper.find(".todo__input").exists()).toBe(false)
  })

  it("stops editing on Enter", async () => {
    const wrapper = mountTodo()

    await wrapper.find(".todo__text").trigger("click")
    await wrapper.find(".todo__input").trigger("keydown.enter")

    expect(wrapper.find(".todo__input").exists()).toBe(false)
  })

  it("emits remove-todo with the todo", async () => {
    const wrapper = mountTodo()

    await buttonByText(wrapper, "Delete").trigger("click")

    expect(wrapper.emitted("remove-todo")).toEqual([
      [{ text: "Buy milk", completed: false }]
    ])
  })
})
