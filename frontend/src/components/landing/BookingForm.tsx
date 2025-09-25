import { Card, Label, TextInput, Select, Button } from "flowbite-react";
import { Datepicker } from "flowbite-react";
import { HiUser, HiMail, HiCalendar, HiUsers } from "react-icons/hi";

export default function BookingSection() {
  return (
    <section
      id="booking"
      className="py-20 px-4 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-3xl mx-auto">
        <Card className="backdrop-blur-sm shadow-2xl rounded-3xl border-0 !bg-white/90">
          <h2 className="text-4xl font-extrabold text-center text-amber-900 mb-10">
            Đặt bàn ngay
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Họ tên */}
            <div>
              <Label htmlFor="name" className="sr-only">
                Họ tên
              </Label>
              <TextInput
                id="name"
                icon={HiUser}
                placeholder="Nguyễn Văn A"
                required
                sizing="lg"
                theme={{
                  field: {
                    input: {
                      base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                    },
                  },
                }}
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="sr-only">
                Email
              </Label>
              <TextInput
                id="email"
                type="email"
                icon={HiMail}
                placeholder="abc@gmail.com"
                required
                sizing="lg"
                theme={{
                  field: {
                    input: {
                      base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                    },
                  },
                }}
              />
            </div>

            {/* Ngày đặt */}
            <div>
              <Label htmlFor="date" className="sr-only">
                Ngày đặt
              </Label>
              <Datepicker
                id="date"
                minDate={new Date()}
                language="vi-VN"
                icon={HiCalendar}
                theme={{
                  root: {
                    input: {
                      field: {
                        input: {
                          base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                        },
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Số khách */}
            <div>
              <Label htmlFor="guests" className="sr-only">
                Số khách
              </Label>
              <Select
                id="guests"
                required
                icon={HiUsers}
                theme={{
                  field: {
                    select: {
                      base: "!bg-amber-50 !border-amber-300 !text-amber-900 !placeholder-amber-400 !focus:ring-amber-500 !focus:border-amber-500",
                    },
                  },
                }}>
                <option value="">Chọn số khách</option>
                <option value="2">2 người</option>
                <option value="4">4 người</option>
                <option value="6">6 người</option>
                <option value="8">8 người</option>
              </Select>
            </div>

            {/* Ghi chú */}
            <div className="md:col-span-2">
              <Label htmlFor="note" className="sr-only">
                Ghi chú
              </Label>
              <TextInput
                id="note"
                placeholder="Ví dụ: Muốn bàn gần cửa sổ"
                sizing="lg"
                theme={{
                  field: {
                    input: {
                      base: "!bg-amber-50 !border-amber-300 !text-amber-900 placeholder-amber-400 focus:!ring-amber-500 focus:!border-amber-500",
                    },
                  },
                }}
              />
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-center">
              <Button
                size="xl"
                className="w-full md:w-auto px-12 py-3 font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-stone-900 rounded-full shadow-lg hover:opacity-90 transition-all">
                Xác nhận đặt bàn
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
