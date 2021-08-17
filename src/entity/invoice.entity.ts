import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne
} from "typeorm";
import { Currency } from "./currency.entity";
import { Module } from "./module.entity";
import { Supplier } from "./supplier.entity";

@Index("invoice_currency_id", ["currencyId"], {})
//@Index("invoice_pk", ["id"], { unique: true })
@Index("invoice_module_id", ["moduleId"], {})
@Index("invoice_supplier_id", ["supplierId"], {})
@Entity("invoice")
export class Invoice extends BaseEntity {
  @Column("uuid", { primary: true, name: "id" })
  id: string;

  @Column("character varying", { name: "invoice_number", length: 20 })
  invoiceNumber: string;

  @Column("integer", { name: "module_id" })
  moduleId: number;

  @Column("integer", { name: "supplier_id" })
  supplierId: number;

  @Column("integer", { name: "currency_id" })
  currencyId: number;

  @Column("numeric", { name: "amount", precision: 15, scale: 3 })
  amount: string;

  // @Column("date", { name: "start_date" })
  // startDate: string;

  // @Column("date", { name: "end_date" })
  // endDate: string;

  @Column("text", { name: "instalment_ids" })
  instalmentIds: string;

  // @Column("integer", { name: "is_invoice_paid", default: () => "0" })
  // isInvoicePaid: number;

  // @Column("date", { name: "created_date" })
  // createdDate: string;

  @ManyToOne(
    () => Currency,
    currency => currency.invoices
  )
  @JoinColumn([{ name: "currency_id", referencedColumnName: "id" }])
  currency: Currency;

  @ManyToOne(
    () => Module,
    module => module.invoices
  )
  @JoinColumn([{ name: "module_id", referencedColumnName: "id" }])
  module: Module;

  @ManyToOne(
    () => Supplier,
    supplier => supplier.invoices
  )
  @JoinColumn([{ name: "supplier_id", referencedColumnName: "id" }])
  supplier: Supplier;
}
