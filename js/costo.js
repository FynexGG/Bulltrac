(function(){
"use strict";
const KEY="costo_km_preventivo_v1";
const DB = {
  mercedes: {
    nombre: 'Mercedes-Benz', icono: '🚚',
    modelos: {
      '1845 LS': {
        millas: [55000, 120000, 180000, 220000],
        partes: [
          { desc: 'CALIBRACIÓN DE VÁLVULAS', cant: 2, um: 'HRS', costo: 684.00, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'FILTRO DE ACEITE', cant: 1, um: 'UNI', costo: 105.50, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'ACEITE DE MOTOR', cant: 39, um: 'LT', costo: 887.60, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'FILTRO DE COMBUSTIBLE', cant: 1, um: 'UNI', costo: 145.00, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'FILTRO SEPARADOR DE AGUA', cant: 1, um: 'UNI', costo: 548.00, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'FILTRO DE VENTILACIÓN TANQUE', cant: 2, um: 'UNI', costo: 124.00, cambios: [180000, 220000] },
          { desc: 'FILTRO DE AIRE', cant: 1, um: 'UNI', costo: 544.00, cambios: [180000, 220000] },
          { desc: 'FILTRO SECADOR DE AIRE', cant: 1, um: 'UNI', costo: 382.00, cambios: [180000, 220000] },
          { desc: 'FILTRO DE CABINA', cant: 1, um: 'UNI', costo: 263.00, cambios: [180000, 220000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 15.30, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'FILTRO ADBLUE', cant: 1, um: 'UNI', costo: 545.00, cambios: [180000, 220000] },
          { desc: 'ELEMENTO FILTRANTE CAJA', cant: 1, um: 'UNI', costo: 598.00, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'JUNTA ANULAR CAJA CAMBIOS', cant: 2, um: 'UNI', costo: 25.00, cambios: [220000] },
          { desc: 'TAPÓN DE CÁRTER MOTOR', cant: 1, um: 'UNI', costo: 195.00, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'ACEITE DE CAJA 75W-85', cant: 13, um: 'LT', costo: 903.00, cambios: [220000] },
          { desc: 'ACEITE DE CORONA 75W-90', cant: 14, um: 'LT', costo: 1038.00, cambios: [220000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 4.5, um: 'LT', costo: 61.90, cambios: [55000, 120000, 180000, 220000] },
          { desc: 'REFRIGERANTE', cant: 8, um: 'GLN', costo: 270.00, cambios: [220000] },
          { desc: 'GRASA', cant: 1, um: 'KG', costo: 25.00, cambios: [55000, 120000, 180000, 220000] }
        ]
      },
      '2651 LS': {
        millas: [60000, 120000, 180000, 240000],
        partes: [
          { desc: 'CALIBRACIÓN DE VÁLVULAS', cant: 2, um: 'HRS', costo: 684.00, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'FILTRO DE ACEITE', cant: 1, um: 'UNI', costo: 105.50, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'ACEITE DE MOTOR', cant: 39, um: 'LT', costo: 887.60, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'FILTRO DE COMBUSTIBLE', cant: 1, um: 'UNI', costo: 145.00, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'FILTRO SEPARADOR DE AGUA', cant: 1, um: 'UNI', costo: 548.00, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'FILTRO DE VENTILACIÓN TANQUE', cant: 2, um: 'UNI', costo: 124.00, cambios: [180000, 240000] },
          { desc: 'FILTRO DE AIRE', cant: 1, um: 'UNI', costo: 544.00, cambios: [180000, 240000] },
          { desc: 'FILTRO SECADOR DE AIRE', cant: 1, um: 'UNI', costo: 382.00, cambios: [180000, 240000] },
          { desc: 'FILTRO DE CABINA', cant: 1, um: 'UNI', costo: 263.00, cambios: [180000, 240000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 15.30, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'FILTRO ADBLUE', cant: 1, um: 'UNI', costo: 545.00, cambios: [180000, 240000] },
          { desc: 'ELEMENTO FILTRANTE CAJA', cant: 1, um: 'UNI', costo: 598.00, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'JUNTA ANULAR CAJA CAMBIOS', cant: 2, um: 'UNI', costo: 25.00, cambios: [240000] },
          { desc: 'TAPÓN DE CÁRTER MOTOR', cant: 1, um: 'UNI', costo: 195.00, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'ACEITE DE CAJA 75W-85', cant: 13, um: 'LT', costo: 903.00, cambios: [240000] },
          { desc: 'ACEITE DE CORONA 75W-90', cant: 14, um: 'LT', costo: 1038.00, cambios: [240000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 4.5, um: 'LT', costo: 61.90, cambios: [60000, 120000, 180000, 240000] },
          { desc: 'REFRIGERANTE', cant: 8, um: 'GLN', costo: 270.00, cambios: [240000] },
          { desc: 'GRASA', cant: 1, um: 'KG', costo: 25.00, cambios: [60000, 120000, 180000, 240000] }
        ]
      },
      'Atego': {
        millas: [7500, 15000, 30000, 45000],
        partes: [
          { desc: 'FILTRO DE ACEITE', cant: 1, um: 'UND', costo: 120.00, cambios: [7500, 15000, 30000, 45000] },
          { desc: 'FILTRO DE COMBUSTIBLE', cant: 1, um: 'UND', costo: 95.00, cambios: [7500, 15000, 30000, 45000] },
          { desc: 'FILTRO SEPARADOR DE AGUA', cant: 1, um: 'UND', costo: 180.00, cambios: [7500, 15000, 30000, 45000] },
          { desc: 'PRE FILTRO DE COMBUSTIBLE', cant: 1, um: 'UND', costo: 85.00, cambios: [15000, 30000, 45000] },
          { desc: 'FILTRO DE AIRE', cant: 1, um: 'UND', costo: 210.00, cambios: [15000, 30000, 45000] },
          { desc: 'FILTRO SECADOR DE AIRE', cant: 1, um: 'UND', costo: 160.00, cambios: [15000, 30000, 45000] },
          { desc: 'FILTRO DE CABINA', cant: 1, um: 'UND', costo: 80.00, cambios: [45000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UND', costo: 110.00, cambios: [15000, 30000, 45000] },
          { desc: 'FILTRO ADBLUE', cant: 1, um: 'UND', costo: 120.00, cambios: [45000] },
          { desc: 'ELEMENTO FILTRANTE CJ ARLA', cant: 1, um: 'UND', costo: 150.00, cambios: [30000, 45000] },
          { desc: 'JUNTA ANULAR CAJA CAMBIOS', cant: 2, um: 'UND', costo: 30.00, cambios: [45000] },
          { desc: 'JUNTA ANULAR CARTER MOTOR', cant: 1, um: 'UND', costo: 25.00, cambios: [7500, 15000, 30000, 45000] },
          { desc: 'ACEITE DE MOTOR 15W-40', cant: 29.5, um: 'LT', costo: 670.00, cambios: [7500, 15000, 30000, 45000] },
          { desc: 'ACEITE DE CAJA GX A 80W', cant: 16, um: 'LT', costo: 450.00, cambios: [45000] },
          { desc: 'ACEITE DE CORONA 80W90', cant: 24, um: 'LT', costo: 680.00, cambios: [15000, 30000, 45000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF220', cant: 4, um: 'LT', costo: 60.00, cambios: [15000, 30000, 45000] },
          { desc: 'GRASA', cant: 1, um: 'UND', costo: 25.00, cambios: [7500, 15000, 30000, 45000] },
          { desc: 'REFRIGERANTE', cant: 14, um: 'UND', costo: 350.00, cambios: [45000] },
          { desc: 'LÍQUIDO DE EMBRAGUE', cant: 1, um: 'UND', costo: 45.00, cambios: [45000] }
        ]
      }
    }
  },
  freightliner: {
    nombre: 'Freightliner', icono: '🚛',
    modelos: {
      'Cascadia': {
        millas: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 280000, 300000, 325000, 350000, 375000, 400000],
        partes: [
          { desc: 'ACEITE DE MOTOR', cant: 12, um: 'GL', costo: 592.24, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 280000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO DE COMBUSTIBLE FF5405', cant: 1, um: 'UNI', costo: 108.89, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 280000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO DE ACEITE LF16046', cant: 1, um: 'UNI', costo: 103.18, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 280000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO SEPARADOR FS19593', cant: 1, um: 'UNI', costo: 80.66, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 280000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'GRASA', cant: 1.5, um: 'KG', costo: 23.89, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 280000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'ACEITE DE RUEDAS', cant: 3, um: 'LT', costo: 15.00, cambios: [100000, 200000, 300000, 400000] },
          { desc: 'ACEITE DE CORONA 85W-140', cant: 10, um: 'GL', costo: 599.50, cambios: [200000, 400000] },
          { desc: 'ACEITE DE CAJA 80W-90', cant: 5, um: 'GL', costo: 262.20, cambios: [200000, 400000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 5, um: 'LT', costo: 82.77, cambios: [200000, 400000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 49.70, cambios: [200000, 400000] },
          { desc: 'FILTROS DE AIRE AF26424', cant: 1, um: 'UNI', costo: 269.70, cambios: [100000, 200000, 300000, 400000] },
          { desc: 'REFRIGERANTE', cant: 10, um: 'GL', costo: 333.74, cambios: [400000] },
          { desc: 'SECADOR DE AIRE AD9', cant: 1, um: 'UNI', costo: 112.00, cambios: [200000, 400000] }
        ]
      }
    }
  },
  kenworth: {
    nombre: 'Kenworth', icono: '🚚',
    modelos: {
      'T680 (20)': {
        millas: [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000],
        partes: [
          { desc: 'ACEITE DE MOTOR', cant: 12, um: 'GL', costo: 578.65, cambios: [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000] },
          { desc: 'FILTRO DE COMBUSTIBLE FS1007', cant: 1, um: 'UNI', costo: 108.89, cambios: [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000] },
          { desc: 'FILTRO DE ACEITE LF14000NN', cant: 1, um: 'UNI', costo: 103.18, cambios: [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000] },
          { desc: 'FILTRO SEPARADOR FS19765', cant: 1, um: 'UNI', costo: 53.33, cambios: [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000] },
          { desc: 'GRASA', cant: 1.65, um: 'KG', costo: 17.52, cambios: [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000, 180000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 400000] },
          { desc: 'ACEITE DE RUEDAS', cant: 2.5, um: 'LT', costo: 15.00, cambios: [100000, 200000, 300000, 400000] },
          { desc: 'FILTRO DE AGUA WF2126', cant: 1, um: 'UNI', costo: 119.97, cambios: [100000, 200000, 300000, 400000] },
          { desc: 'ACEITE DE CORONA 85W-140', cant: 10, um: 'GL', costo: 555.00, cambios: [200000, 400000] },
          { desc: 'ACEITE DE CAJA 80W-90', cant: 5, um: 'GL', costo: 238.45, cambios: [200000, 400000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 5, um: 'LT', costo: 50.05, cambios: [200000, 400000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 49.59, cambios: [200000, 400000] },
          { desc: 'FILTROS DE AIRE AF27688', cant: 1, um: 'UNI', costo: 522.94, cambios: [100000, 200000, 300000, 400000] },
          { desc: 'REFRIGERANTE', cant: 10, um: 'GL', costo: 333.74, cambios: [400000] },
          { desc: 'SECADOR DE AIRE AD9', cant: 1, um: 'UNI', costo: 101.40, cambios: [200000, 400000] }
        ]
      },
      'T800 (25)': {
        millas: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000],
        partes: [
          { desc: 'ACEITE DE MOTOR', cant: 12, um: 'GL', costo: 582.00, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO DE COMBUSTIBLE FS1007', cant: 1, um: 'UNI', costo: 108.89, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO SEPARADOR FS1000', cant: 1, um: 'UNI', costo: 37.86, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO ACEITE LF14000NN', cant: 1, um: 'UNI', costo: 103.18, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'GRASA', cant: 1.65, um: 'KG', costo: 17.52, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'ACEITE DE RUEDAS', cant: 2.5, um: 'LT', costo: 15.00, cambios: [125000, 250000, 375000] },
          { desc: 'FILTRO DE AGUA WF2126', cant: 1, um: 'UNI', costo: 119.97, cambios: [125000, 250000, 375000] },
          { desc: 'ACEITE DE CORONA 85W-140', cant: 10, um: 'GL', costo: 555.00, cambios: [250000] },
          { desc: 'ACEITE DE CAJA 80W-90', cant: 5, um: 'GL', costo: 238.45, cambios: [250000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 5, um: 'LT', costo: 50.05, cambios: [250000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 49.59, cambios: [250000] },
          { desc: 'FILTROS DE AIRE AF27688', cant: 1, um: 'UNI', costo: 522.94, cambios: [125000, 250000, 375000] },
          { desc: 'REFRIGERANTE', cant: 10, um: 'GL', costo: 333.74, cambios: [400000] },
          { desc: 'SECADOR DE AIRE AD9', cant: 1, um: 'UNI', costo: 101.40, cambios: [250000] }
        ]
      }
    }
  },
  mack: {
    nombre: 'Mack', icono: '🚛',
    modelos: {
      'CXU': {
        millas: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000],
        partes: [
          { desc: 'ACEITE DE MOTOR', cant: 12, um: 'GL', costo: 492.48, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO DE ACEITE LF667', cant: 2, um: 'UNI', costo: 55.81, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO DE COMBUSTIBLE FF254', cant: 1, um: 'UNI', costo: 29.11, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO DE ACEITE BYPASS LF17502', cant: 1, um: 'UNI', costo: 32.64, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'FILTRO SEPARADOR DE AGUA FS20203', cant: 1, um: 'UNI', costo: 45.27, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'GRASA', cant: 1.5, um: 'KG', costo: 16.75, cambios: [25000, 50000, 75000, 100000, 125000, 150000, 175000, 200000, 225000, 250000, 275000, 300000, 325000, 350000, 375000, 400000] },
          { desc: 'ACEITE DE CORONA 85W-140', cant: 10, um: 'GL', costo: 579.15, cambios: [200000, 400000] },
          { desc: 'ACEITE DE CAJA 75W-80', cant: 5, um: 'GL', costo: 272.50, cambios: [200000, 400000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 5, um: 'LT', costo: 99.25, cambios: [200000, 400000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 68.73, cambios: [200000, 400000] },
          { desc: 'FILTROS DE AIRE', cant: 1, um: 'UNI', costo: 178.00, cambios: [100000, 200000, 300000, 400000] },
          { desc: 'REFRIGERANTE', cant: 10, um: 'GL', costo: 333.74, cambios: [200000, 400000] },
          { desc: 'SECADOR DE AIRE AD27750', cant: 1, um: 'UNI', costo: 72.21, cambios: [400000] }
        ]
      }
    }
  },
  shacman: {
    nombre: 'Shacman', icono: '🚛',
    modelos: {
      'Gas': {
        millas: [10000, 40000, 80000],
        partes: [
          { desc: 'CALIBRACIÓN DE VÁLVULAS', cant: 3, um: 'HRS', costo: 570.00, cambios: [40000, 80000] },
          { desc: 'FILTRO DE ACEITE', cant: 2, um: 'UNI', costo: 85.00, cambios: [10000, 40000, 80000] },
          { desc: 'ACEITE DE MOTOR', cant: 8, um: 'GLN', costo: 390.00, cambios: [10000, 40000, 80000] },
          { desc: 'FILTRO DE GAS ALTA PRESIÓN', cant: 1, um: 'UNI', costo: 68.00, cambios: [10000, 40000, 80000] },
          { desc: 'FILTRO DE GAS BAJA PRESIÓN', cant: 1, um: 'UNI', costo: 255.00, cambios: [10000, 40000, 80000] },
          { desc: 'GRASA', cant: 1, um: 'KG', costo: 18.00, cambios: [10000, 40000, 80000] },
          { desc: 'ACEITE DE CAJA 80W-90', cant: 10, um: 'GLN', costo: 250.00, cambios: [80000] },
          { desc: 'ACEITE DE CORONA 75W-90', cant: 5, um: 'GLN', costo: 180.00, cambios: [10000, 80000] },
          { desc: 'FILTRO SECADOR DE AIRE', cant: 1, um: 'UNI', costo: 120.00, cambios: [80000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 65.00, cambios: [10000, 80000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 5, um: 'LT', costo: 60.00, cambios: [10000, 80000] },
          { desc: 'KIT FILTROS DE AIRE', cant: 1, um: 'UNI', costo: 217.51, cambios: [80000] },
          { desc: 'BUJÍAS', cant: 6, um: 'UNI', costo: 300.00, cambios: [80000] },
          { desc: 'REFRIGERANTE', cant: 10, um: 'GLN', costo: 333.74, cambios: [80000] }
        ]
      }
    }
  },
  foton: {
    nombre: 'Foton', icono: '🚛',
    modelos: {
      'Auman': {
        millas: [35000, 70000, 105000, 140000, 175000, 210000],
        partes: [
          { desc: 'ACEITE DE MOTOR', cant: 10, um: 'GL', costo: 482.20, cambios: [35000, 70000, 105000, 140000, 175000, 210000] },
          { desc: 'FILTRO DE ACEITE', cant: 1, um: 'UNI', costo: 84.75, cambios: [35000, 70000, 105000, 140000, 175000, 210000] },
          { desc: 'FILTRO DE COMBUSTIBLE', cant: 1, um: 'UNI', costo: 105.93, cambios: [35000, 70000, 105000, 140000, 175000, 210000] },
          { desc: 'FILTRO SEPARADOR', cant: 1, um: 'UNI', costo: 110.17, cambios: [35000, 70000, 105000, 140000, 175000, 210000] },
          { desc: 'GRASA', cant: 2, um: 'KG', costo: 48.22, cambios: [35000, 70000, 105000, 140000, 175000, 210000] },
          { desc: 'CALIBRACIÓN', cant: 4, um: 'H', costo: 684.00, cambios: [105000, 210000] },
          { desc: 'ACEITE DE CORONA 85W-140', cant: 10, um: 'GL', costo: 554.80, cambios: [210000] },
          { desc: 'ACEITE DE CAJA 75W-80', cant: 5, um: 'GL', costo: 122.00, cambios: [210000] },
          { desc: 'FILTRO RETARDADOR', cant: 1, um: 'UNI', costo: 239.60, cambios: [210000] },
          { desc: 'ACEITE DE DIRECCIÓN ATF', cant: 5, um: 'LT', costo: 63.18, cambios: [210000] },
          { desc: 'FILTRO DE DIRECCIÓN', cant: 1, um: 'UNI', costo: 50.75, cambios: [210000] },
          { desc: 'FILTROS DE AIRE', cant: 1, um: 'UNI', costo: 217.51, cambios: [105000, 210000] },
          { desc: 'FILTRO DE UREA', cant: 1, um: 'UNI', costo: 80.51, cambios: [35000, 70000, 105000, 140000, 175000, 210000] },
          { desc: 'FILTRO DE BOMBA DE UREA', cant: 1, um: 'UNI', costo: 29.80, cambios: [70000, 140000, 210000] },
          { desc: 'REFRIGERANTE', cant: 10, um: 'GL', costo: 333.74, cambios: [210000] },
          { desc: 'SECADOR DE AIRE', cant: 1, um: 'UNI', costo: 72.00, cambios: [210000] }
        ]
      }
    }
  }
};
let marcaActiva=Object.keys(DB)[0],modeloActivo=Object.keys(DB[marcaActiva].modelos)[0],tipoCambio=3.60,isEditing=false,listo=false;
const $=id=>document.getElementById(id);
const fmt=n=>n.toLocaleString('es-PE',{minimumFractionDigits:2,maximumFractionDigits:2});
const toast=(m,t)=>window.showToast&&window.showToast(m,t||'success');
const cloud=()=>{window.__subir&&window.__subir()};
function snapshot(){const p={};Object.keys(DB).forEach(k=>Object.keys(DB[k].modelos).forEach(m=>DB[k].modelos[m].partes.forEach(x=>{p[k+'|'+m+'|'+x.desc]=x.costo})));return{tc:tipoCambio,precios:p}}
function aplicar(s){if(!s||typeof s!=='object')return;if(s.tc>0)tipoCambio=s.tc;const p=s.precios||{};Object.keys(DB).forEach(k=>Object.keys(DB[k].modelos).forEach(m=>DB[k].modelos[m].partes.forEach(x=>{const v=p[k+'|'+m+'|'+x.desc];if(typeof v==='number'&&v>=0)x.costo=v})))}
function guardarLocal(){try{localStorage.setItem(KEY,JSON.stringify(snapshot()))}catch(e){}}
try{aplicar(JSON.parse(localStorage.getItem(KEY)||'null'))}catch(e){}

function renderTabs(){
  const box=$('costoTabs');if(!box)return;
  box.innerHTML='';
  Object.keys(DB).forEach(k=>{
    const b=document.createElement('button');
    b.className='tab';b.dataset.view='costo-'+k;
    b.innerHTML='<span class="ico">'+DB[k].icono+'</span><span class="txt">'+DB[k].nombre+'</span>';
    b.addEventListener('click',()=>window.switchView('costo-'+k));
    box.appendChild(b);
  });
}
function renderSubtabs(){
  const box=$('subtabsModelos');
  box.innerHTML=Object.keys(DB[marcaActiva].modelos).map(m=>'<button class="csubtab'+(m===modeloActivo?' active':'')+'" data-modelo="'+m+'">'+m+'</button>').join('');
  box.querySelectorAll('.csubtab').forEach(b=>b.onclick=()=>{commit();modeloActivo=b.dataset.modelo;renderSubtabs();renderTabla()});
  $('costoTitulo').textContent='💰 Costo por km preventivo · '+DB[marcaActiva].nombre;
}
function renderTabla(){
  const md=DB[marcaActiva].modelos[modeloActivo],millas=md.millas,partes=md.partes;
  let h='<tr><th class="col-desc">DESCRIPCIÓN</th><th class="col-cant">CAN.</th><th class="col-um">U.M.</th><th class="col-precio">PRECIO (S/)</th>';
  millas.forEach(m=>{h+='<th>'+(m>=1000?(m/1000)+'MIL':m)+'</th>'});
  $('tableHead').innerHTML=h+'</tr>';
  let b='';const tot=new Array(millas.length).fill(0);
  partes.forEach(p=>{
    const pr=isEditing?'<input type="number" step="0.01" class="edit-price" value="'+p.costo.toFixed(2)+'" data-desc="'+p.desc.replace(/"/g,'&quot;')+'">':'S/ '+fmt(p.costo);
    b+='<tr><td class="cell-desc">'+p.desc+'</td><td class="cell-cant">'+p.cant+'</td><td class="cell-um">'+p.um+'</td><td class="cell-precio">'+pr+'</td>';
    millas.forEach((m,i)=>{if(p.cambios.includes(m)){b+='<td class="cell-x">X</td>';tot[i]+=p.costo}else b+='<td class="cell-empty">-</td>'});
    b+='</tr>';
  });
  $('tableBody').innerHTML=b;
  let f='<tr><td class="foot-label" colspan="3">MONTO (S/)</td><td class="foot-empty" style="background:#f1f5f9"></td>',gS=0,gU=0,us=[];
  tot.forEach(t=>{f+='<td>S/ '+fmt(t)+'</td>';gS+=t;const u=t/tipoCambio;us.push(u);gU+=u});
  f+='</tr><tr class="total-row"><td class="foot-label" colspan="3">TOTAL (USD)</td><td class="foot-empty" style="background:#c7d2fe"></td>';
  us.forEach(t=>{f+='<td>US$ '+fmt(t)+'</td>'});
  $('tableFoot').innerHTML=f+'</tr>';
  const mx=millas[millas.length-1];
  $('kpisCostos').innerHTML=[['#2563eb','S/ '+fmt(gS),'Costo Total (S/)'],['#0ea5e9','US$ '+fmt(gU),'Costo Total (USD)'],['#f59e0b','S/ '+fmt(gS/mx),'Costo por km (S/)'],['#8b5cf6','US$ '+fmt(gU/mx),'Costo por km (USD)']].map(k=>'<div class="kpi" style="--c:'+k[0]+'"><div class="val">'+k[1]+'</div><div class="lbl">'+k[2]+'</div></div>').join('');
}
function commit(){
  if(!isEditing)return;
  const md=DB[marcaActiva].modelos[modeloActivo];
  document.querySelectorAll('#tableBody .edit-price').forEach(i=>{const p=md.partes.find(x=>x.desc===i.dataset.desc),v=parseFloat(i.value);if(p&&!isNaN(v)&&v>=0)p.costo=v});
}
function setEdit(on){
  isEditing=on;
  $('btnCostoEditar').style.display=on?'none':'inline-flex';
  $('btnCostoGuardar').style.display=on?'inline-flex':'none';
  const t=$('costoTc');t.disabled=!on;t.classList.toggle('editing',on);
}
$('btnCostoEditar').onclick=()=>{setEdit(true);renderTabla();toast('Modo edición activado. Modifica los precios y presiona Guardar.','info')};
$('btnCostoGuardar').onclick=()=>{
  const tc=parseFloat($('costoTc').value);
  if(tc>0)tipoCambio=tc;else{toast('Tipo de cambio inválido, se mantiene el anterior.','warn');$('costoTc').value=tipoCambio.toFixed(2)}
  commit();setEdit(false);renderTabla();guardarLocal();cloud();toast('✅ Cambios guardados correctamente','success');
};
$('btnCostoExportar').onclick=()=>{
  (window.__cargarXLSX?window.__cargarXLSX():Promise.resolve()).then(()=>{
    if(typeof XLSX==='undefined'){toast('Librería Excel no disponible','warn');return}
    const md=DB[marcaActiva].modelos[modeloActivo];
    const rows=md.partes.map(p=>{const r={'DESCRIPCIÓN':p.desc,'CANT.':p.cant,'U.M.':p.um,'PRECIO (S/)':p.costo};md.millas.forEach(m=>{r[(m/1000)+'MIL']=p.cambios.includes(m)?'X':''});return r});
    const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows),'Costo por km');
    XLSX.writeFile(wb,'Costo_km_preventivo_'+DB[marcaActiva].nombre+'_'+modeloActivo+'.xlsx');
    toast('📊 Excel exportado correctamente','success');
  });
};
window.__costoSelect=function(k){
  if(!DB[k])return;
  if(k!==marcaActiva){commit();marcaActiva=k;modeloActivo=Object.keys(DB[k].modelos)[0]}
  if(!listo||k===marcaActiva){renderSubtabs();renderTabla();listo=true}
};
window.__costoGet=()=>snapshot();
window.__costoApplyRemote=function(s){aplicar(s);$('costoTc').value=tipoCambio.toFixed(2);guardarLocal();renderSubtabs();renderTabla()};
$('costoTc').value=tipoCambio.toFixed(2);
renderTabs();renderSubtabs();renderTabla();listo=true;
document.querySelectorAll('.sidebar .tab').forEach(t=>t.classList.toggle('active',t.dataset.view===(document.querySelector('.panel.active')?.id||'').replace('panel-','')));
})();
