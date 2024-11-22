# **Node-RED Contrib Time Validator**

## **Description**

The **Time Validator** is a custom Node-RED node designed to validate whether the current date and time fall within a specific range or match predefined conditions. This node is useful for scheduling, flow control, and dynamic validation based on user-defined time periods.

### **Features**

- **Custom Time Validation**: Supports multiple validation types (`specific`, `annual`, `day`, `week`) to check if the current date/time falls within a configured range.
- **Flexible Configuration**: Allows setting multiple date blocks with start/end times and activation status.
- **Priority-Based Evaluation**: Evaluates validation rules in the order of priority: `specific` → `annual` → `day` → `week`.
- **Output Custom Results**: Outputs a structured object with validation status and details for further flow processing.

---

## **Installation**

Install via NPM in your Node-RED directory:

```bash
npm install node-red-contrib-time-validator
```

Or globally:

```bash
npm install -g node-red-contrib-time-validator
```

---

## **How to Use**

1. Drag the **Time Validator** node into your Node-RED flow.
2. Configure validation blocks with the following options:
   - **Validation Type**: Choose between `specific`, `annual`, `day`, or `week`.
   - **Time Range**: Define start and end times.
   - **Activation Status**: Enable or disable specific blocks.
3. Connect the node to your flow to filter or process messages based on the validation result.

---

## **Inputs**

- **Message Object (**`msg`):
  - The node processes the incoming message to determine if it passes validation. Input messages can include additional parameters if needed.

---

## **Outputs**

- **Output 1 (Valid)**: The message is passed through this output if the conditions are met.
- **Output 2 (Invalid)**: The message is passed through this output if the conditions are not met.
- **Message Object (**`msg.result`): Returns a detailed validation result with the following structure:
  ```json
  {
    "status": "valid",
    "value": "2024-11-20",
    "startTime": "09:00",
    "endTime": "17:00",
    "isActive": true,
    "blockType": "specific",
    "checkedAt": "2024-11-20T14:34:00Z"
  }
  ```

---

## **Example Flow**

```json
[{
    "id": "3b7630dbe77d213d",
    "type": "inject",
    "z": "f6f2187d.f17ca8",
    "name": "",
    "props": [{
        "p": "payload"
      },
      {
        "p": "topic",
        "vt": "str"
      }
    ],
    "repeat": "",
    "crontab": "",
    "once": false,
    "onceDelay": 0.1,
    "topic": "",
    "payload": "",
    "payloadType": "date",
    "x": 220,
    "y": 160,
    "wires": [
      [
        "8f89bfb23747b71a"
      ]
    ]
  },
  {
    "id": "a308aaf71704f15f",
    "type": "debug",
    "z": "f6f2187d.f17ca8",
    "name": "debug 1",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "true",
    "targetType": "full",
    "statusVal": "",
    "statusType": "auto",
    "x": 660,
    "y": 140,
    "wires": []
  },
  {
    "id": "4cd8ce4dd9f6da6e",
    "type": "debug",
    "z": "f6f2187d.f17ca8",
    "name": "debug 2",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "true",
    "targetType": "full",
    "statusVal": "",
    "statusType": "auto",
    "x": 660,
    "y": 180,
    "wires": []
  },
  {
    "id": "8f89bfb23747b71a",
    "type": "time-validator",
    "z": "f6f2187d.f17ca8",
    "name": "",
    "active": "true",
    "timezone": "-3",
    "dateBlocks": [{
        "type": "week",
        "value": [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday"
        ],
        "isActive": "true",
        "startTime": "18:00",
        "endTime": "22:00"
      },
      {
        "type": "day",
        "value": "21",
        "isActive": "true",
        "startTime": "20:30",
        "endTime": "21:30"
      },
      {
        "type": "annual",
        "value": "21/11",
        "isActive": "true",
        "startTime": "20:00",
        "endTime": "22:00"
      },
      {
        "type": "specific",
        "value": "2024-11-21",
        "isActive": "false",
        "startTime": "20:00",
        "endTime": "22:00"
      }
    ],
    "x": 460,
    "y": 160,
    "wires": [
      [
        "a308aaf71704f15f"
      ],
      [
        "4cd8ce4dd9f6da6e"
      ]
    ]
  }
]
```

---

## **Contribution**

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push your branch (`git push origin feature-name`).
5. Open a Pull Request.

---

## **License**

Distributed under the **MIT License**. See the LICENSE file for more details.

---

## **Contact**

Lucas Santos - [lucassouzamda@gmail.com](mailto:lucassouzamda@gmail.com "‌")

**GitHub Repository**: [https://github.com/lucassantossouza/node-red-contrib-time-validator](https://github.com/lucassantossouza/node-red-contrib-time-validator "smartCard-inline")