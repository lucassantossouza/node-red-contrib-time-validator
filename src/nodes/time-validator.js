// Criar uma função que verificar se esta dentro do periodo configurado
function isHourBetween(startTime, endTime, date, node) {
  if (!startTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    node.error("Invalid startTime format", msg);
    return false;
  }
  if (!endTime.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
    node.error("Invalid endTime format", msg);
    return false;
  }

  date = new Date(date);
  if (isNaN(date)) {
    node.error("Invalid date format", msg);
    return false;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();

  if (currentHour < startHour || currentHour > endHour) {
    return false;
  } else if (currentHour === startHour && currentMinute < startMinute) {
    return false;
  } else if (currentHour === endHour && currentMinute > endMinute) {
    return false;
  }

  return true;
}

module.exports = function (RED) {
  function TimeValidatorNode(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.log("Config", config);

    const active = config.active === "true";
    const timezoneOffset = config.timezone || "-3";
    const dateBlocks = config.dateBlocks || [];

    node.on("input", function (msg, send, done) {

      if (!active) {
        node.send([null, msg]);
        return;
      }

      const now = new Date();
      const dateNow = new Date(now.getTime() + parseInt(timezoneOffset) * 60 * 60 * 1000);

      function validateBlock(type, value, dateNow, startTime, endTime) {
        const [dayNow, monthNow, yearNow] = [
          dateNow.getDate(),
          dateNow.getMonth() + 1,
          dateNow.getFullYear(),
        ];
        const dayOfWeekMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const currentDayOfWeek = dayOfWeekMap[dateNow.getDay()];

        let isYearValid = true;
        let isMonthValid = true;
        let isDayValid = true;

        // Validar ano, mês e dia para tipo 'specific'
        if (type === "specific") {
          const [yearValue, monthValue, dayValue] = value.split("-").map(Number);
          isYearValid = yearValue === yearNow;
          isMonthValid = monthValue === monthNow;
          isDayValid = dayValue === dayNow;
        } else if (type === "annual") {
          // Validar mês e dia para tipo 'annual'
          const [dayValue, monthValue] = value.split("/").map(Number);
          isMonthValid = monthValue === monthNow;
          isDayValid = dayValue === dayNow;
        } else if (type === "day") {
          // Validar apenas o dia para tipo 'day'
          const dayValue = parseInt(value, 10);
          isDayValid = dayValue === dayNow;
        }

        return {
          hours: isHourBetween(startTime, endTime, dateNow, node),
          year: isYearValid,
          month: isMonthValid,
          day: isDayValid,
          week: type === "week" ? Array.isArray(value) && value.includes(currentDayOfWeek) : true,
        };
      }

      function adjustDates(block, dateNow, timezoneOffset) {
        let date = {
          start: "",
          end: ""
        };

        if (block.type === "specific") {
          date.start = `${block.value}T${block.startTime}:00.000`;
          date.end = `${block.value}T${block.endTime}:00.000`;
        } else if (block.type === "annual") {
          const [day, month] = block.value.split("/");
          date.start = `${dateNow.getFullYear()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${block.startTime}:00.000`;
          date.end = `${dateNow.getFullYear()}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${block.endTime}:00.000`;
        } else if (block.type === "day") {
          date.start = `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, '0')}-${block.value.padStart(2, '0')}T${block.startTime}:00.000`;
          date.end = `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, '0')}-${block.value.padStart(2, '0')}T${block.endTime}:00.000`;
        } else if (block.type === "week") {
          date.start = `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, '0')}-${dateNow.getDate().toString().padStart(2, '0')}T${block.startTime}:00.000`;
          date.end = `${dateNow.getFullYear()}-${(dateNow.getMonth() + 1).toString().padStart(2, '0')}-${dateNow.getDate().toString().padStart(2, '0')}T${block.endTime}:00.000`;
        }

        // Criação das datas a partir do valor local, sem 'Z'
        const start = new Date(date.start);
        const end = new Date(date.end);

        return {
          start,
          end
        };
      }

      for (const block of dateBlocks) {
        const {
          start,
          end
        } = adjustDates(block, dateNow, timezoneOffset);

        const valueAdjusted =
          block.type === "specific" ?
          start.toISOString().slice(0, 10) :
          block.type === "annual" ?
          `${start.getDate()}/${start.getMonth() + 1}` :
          block.type === "day" ?
          `${start.getDate()}` :
          block.value; // Para semanas

        block.validate = validateBlock(
          block.type,
          valueAdjusted,
          dateNow,
          start.toISOString().slice(11, 16),
          end.toISOString().slice(11, 16)
        );
      }

      // Função para determinar o bloco válido, respeitando a ordem de prioridade desejada
      function findValidBlock(dateBlocks) {
        // Prioridades em ordem: Specific -> Annual -> Day -> Week
        const priorities = ["specific", "annual", "day", "week"];

        for (const priority of priorities) {
          const validBlock = dateBlocks.find((block) => {
            if (block.type === priority) {
              if (priority === "specific") {
                return block.validate.hours && block.validate.year && block.validate.month && block.validate.day;
              } else if (priority === "annual") {
                return block.validate.hours && block.validate.month && block.validate.day;
              } else if (priority === "day") {
                return block.validate.hours && block.validate.day;
              } else if (priority === "week") {
                return block.validate.hours && block.validate.week;
              }
            }
            return false;
          });

          if (validBlock) {
            return validBlock; // Retorna assim que encontrar um bloco válido de maior prioridade
          }
        }

        return null; // Se nenhum bloco for válido
      }

      const validBlock = findValidBlock(dateBlocks);

      msg.result = {
        status: validBlock ? "valid" : "invalid",
        value: validBlock ? validBlock.value : null,
        startTime: validBlock ? validBlock.startTime : null,
        endTime: validBlock ? validBlock.endTime : null,
        isActive: validBlock ? validBlock.isActive == "true" : null,
        blockType: validBlock ? validBlock.type : null, // Tipo do bloco (specific, annual, day, week)
        checkedAt: dateNow.toISOString(), // Registro da data/hora da validação
      };

      if (validBlock) {
        if (validBlock.isActive === 'true') node.send([msg, null]);
        else node.send([null, msg]);
      } else node.send([null, msg]);

      done();
    });
  }

  RED.nodes.registerType("time-validator", TimeValidatorNode);
};