/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { waitFor, fireEvent } from "@testing-library/dom"
import store from "../__mocks__/store"
import mockStore from "../__mocks__/store"



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')    
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    })

    test('Then, I have form for new bill', () => {
      document.body.innerHTML = NewBillUI()
      expect(screen.getByTestId('form-new-bill')).toHaveLength(9)
    })

    test('Then, verification of the submit event and its default action', () => {
      document.body.innerHTML = NewBillUI()
      const newBill = new NewBill({
        document, onNavigate, store, localStorage: window.localStorage
    })
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e))
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })   

  describe("When I upload an image in file input", () => {
    describe("If the file is not an image", () => {
      test("Then the file format should be invalid", () => {
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        const changeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");
    
        file.addEventListener("change", changeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["file"], "file.css", { type: "doc/css" })],
          },
        });

        expect(changeFile).toHaveBeenCalled();
        expect(file.classList.contains('format-error')).toBe(true);
      })
    });

    describe("If the file is an image format", () => {
      test("Then the file format should be valid", () => {
        document.body.innerHTML = NewBillUI();
        const newBill = new NewBill({ document, onNavigate, store, localStorage });
        const changeFile = jest.fn(newBill.handleChangeFile);
        const file = screen.getByTestId("file");
    
        file.addEventListener("change", changeFile);
        fireEvent.change(file, {
          target: {
            files: [new File(["file"], "file.png", { type: "image/png" })],
          },
        });

        expect(changeFile).toHaveBeenCalled();
        expect(file.classList.contains('format-error')).toBe(false);
      })
      });
    })
  })
})

