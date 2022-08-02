/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { waitFor, fireEvent } from "@testing-library/dom";
import store from "../__mocks__/store";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });

    test("Then, I have form for new bill", () => {
      document.body.innerHTML = NewBillUI();
      expect(screen.getByTestId("form-new-bill")).toHaveLength(9);
    });

    test("Then, the function handleSubmit should be valid", () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    });

    describe("When I upload an image in file input", () => {
      describe("If the file is not an image", () => {
        test("Then the file format should be invalid", () => {
          document.body.innerHTML = NewBillUI();
          const newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage,
          });
          const changeFile = jest.fn(newBill.handleChangeFile);
          const file = screen.getByTestId("file");

          file.addEventListener("change", changeFile);
          fireEvent.change(file, {
            target: {
              files: [new File(["file"], "file.css", { type: "doc/css" })],
            },
          });

          expect(changeFile).toHaveBeenCalled();
          expect(file.classList.contains("format-error")).toBe(true);
        });
      });

      describe("If the file is an image format", () => {
        test("Then the file format should be valid", () => {
          document.body.innerHTML = NewBillUI();
          const newBill = new NewBill({
            document,
            onNavigate,
            store,
            localStorage,
          });
          const changeFile = jest.fn(newBill.handleChangeFile);
          const file = screen.getByTestId("file");

          file.addEventListener("change", changeFile);
          fireEvent.change(file, {
            target: {
              files: [new File(["file"], "file.png", { type: "image/png" })],
            },
          });

          expect(changeFile).toHaveBeenCalled();
          expect(file.classList.contains("format-error")).toBe(false);
        });
      });
    });
  });
});

//Test d'intégration POST
describe("Given I am connected as an employee", () => {
  describe("When I create a new bill", () => {
    test("Then the bill is successfully submited", async () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      Object.defineProperty(window, "localeStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const testValidBill = {
        type: "Hôtel et logement",
        name: "hôtel de test",
        date: "2022-04-19",
        amount: 150,
        vat: 20,
        pct: 20,
        commentary: "test",
        fileUrl: "../img/test.jpg",
        fileName: "test.jpg",
        status: "pending",
      };

      //charge les valeurs dans les champs
      screen.getByTestId("expense-type").value = testValidBill.type;
      screen.getByTestId("expense-name").value = testValidBill.name;
      screen.getByTestId("datepicker").value = testValidBill.date;
      screen.getByTestId("amount").value = testValidBill.amount;
      screen.getByTestId("vat").value = testValidBill.vat;
      screen.getByTestId("pct").value = testValidBill.pct;
      screen.getByTestId("commentary").value = testValidBill.commentary;
      newBill.fileUrl = testValidBill.fileUrl;
      newBill.fileName = testValidBill.fileName;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const form = screen.getByTestId("form-new-bill");
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    });

    test("Then fetch error 500 from API", async () => {
      jest.spyOn(mockStore, "bills");
      jest.spyOn(console, "error").mockImplementation(() => {});

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      Object.defineProperty(window, "location", {
        value: { hash: ROUTES_PATH["NewBill"] },
      });

      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      document.body.innerHTML = `<div id="root"></div>`;
      router();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        };
      });
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Soumission du formulaire
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
    });
  });
});
