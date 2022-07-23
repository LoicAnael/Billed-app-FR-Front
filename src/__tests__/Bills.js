/**
 * @jest-environment jsdom
 */
import {getAllByText, getAllByTestId , getByTestId, queryAllByTestId} from '@testing-library/dom'
import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from '@testing-library/user-event'
import Bills from "../containers/Bills.js"
import store from "../__mocks__/store"

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
    });
   
})

