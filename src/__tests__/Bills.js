/**
 * @jest-environment jsdom
 */
import { getAllByText, getByText, getAllByTestId, getByTestId, queryAllByTestId } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import {ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js"
import store from "../__mocks__/store"
import mockStore from "../__mocks__/store"

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true);
    })
    
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })   
      const dates = screen.getAllByTestId('format-date').map(a => a.innerHTML);
      console.log({dates})
      const antiChrono = (a, b) => ((a < b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  })
  ////////ajout des tests unitaires et d'integrations/////////
  
    test("Then click on eye icon", () => {
      document.body.innerHTML  = BillsUI({ data: bills });
      const BillsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      });
  
      $.fn.modal = jest.fn();
      const iconEyes = screen.getAllByTestId("icon-eye");
      for (let i = 0; i < iconEyes.length; i++) {
        const icon = iconEyes[i];
        const handleClickIconEye = jest.fn(() => BillsPage.handleClickIconEye(icon));
  
        icon.addEventListener("click", handleClickIconEye);
        userEvent.click(icon);
  
        expect(iconEyes).toBeTruthy();
        expect(handleClickIconEye).toHaveBeenCalled();

        const modale = screen.getByTestId('modalFileEmployee')
        expect(modale).toBeTruthy()
      }
    });
  
    test("Then click on the new bill button", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
      const BillsPage = new Bills({
        document, onNavigate, store, localStorage: window.localStorage
      });
   
      let newBillBtn = screen.getByTestId("btn-new-bill");
      let handleClickNewBill = jest.fn(() => BillsPage.handleClickNewBill(newBillBtn));
      newBillBtn.addEventListener("click", handleClickNewBill);
      userEvent.click(newBillBtn)
      expect(handleClickNewBill).toHaveBeenCalled();

      const modale = screen.getByTestId('icon-window')
      expect(modale).toBeTruthy()
    });
   
})


// test d'integration GET


  describe("When an error occurs on API", () => { //erreur sur l'api
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock
      })
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'a@a'
        })
      )
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.appendChild(root)
      router()
    })

    test("Then i fetch the invoices in the api and it fails with a 404 error", async () => {//recupère les facture api et echoue avec erreur 404
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: "Erreur 404" });
      const message = screen.getByText(/Erreur 404/);
      console.log(message)
      expect(message).toBeTruthy()
    })

    test("Then i fetch the invoices in the api and it fails with a 500 error", async () => {//recupère les facture api et echoue avec erreur 500
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })
      document.body.innerHTML = BillsUI({ error: "Erreur 500" });
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

  