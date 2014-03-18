{
    "__comment": "e.g. curl --request POST --data-binary @- htp://transformer.zepheira.com:8883/augment.freemix.json < ~/dev/zepheira/freemix-akara/test/resource/augment/augment_test2.js",
    "items": [
        {
            "id": "_1",
            "label": "_1",
            "city": "Fredericksburg",
            "state": "VA",
            "zip": "22408",
            "start": "20030322",
            "end": "20081008193808",
            "Name": "Zepheira",
            "comment": "Place augmentation expected to fail"
        },
        {
            "id": "_2",
            "label": "_2",
            "city": "Mountain View",
            "state": "VA",
            "zip": "94043",
            "start": "2008/08/28",
            "Name": "Google"
        },
        {
            "id": "_3",
            "label": "_3",
            "city": "Louisville",
            "state": "CO",
            "zip": "80027-4545",
            "start": "Tue Feb 16 07:15:21 MST 208",
            "end": "2010",
            "Name": "Avista Adventist Hospital",
            "comment": "Date augmentation expected to fail"
        },
        {
            "id": "_4",
            "label": "_4",
            "city": null,
            "state": null,
            "zip": null,
            "start": "1840",
            "end": "1910",
            "Name": "Old stuff",
            "comment": "YYYY date augmentations"
        }
    ],
    "data_profile": {
        "original_MIME_type": "application/vnd.ms-excel",
        "label": "Augmentation test",
        "Akara_MIME_type_guess": "application/vnd.ms-excel",
        "properties": [
        {
            "property": "label",
             "enabled": true,
             "label": "label",
             "tags": ["property:type=text"]
        },
        {
            "property": "id",
             "enabled": true,
             "label": "id",
             "tags": ["property:type=text"]
        },
        {
            "property": "city",
             "enabled": true,
             "label": "City",
             "tags": ["property:type=text"]
        },
        {
            "property": "state",
             "enabled": true,
             "label": "State",
             "tags": ["property:type=text"]
        },
        {
            "property": "zip",
             "enabled": true,
             "label": "Zip",
             "tags": ["property:type=text"]
        },
        {
            "property": "name",
             "enabled": true,
             "label": "Name",
             "tags": ["property:type=text"]
        },
        {
            "property": "start",
             "enabled": true,
             "label": "Start date",
             "tags": ["property:type=text"]
        },
        {
            "property": "where",
            "enabled": true,
            "label": "Where",
            "tags": ["property:type=location"],
            "composite": [
                "street_address",
                "city",
                "state",
                "zip"
            ]
        },
        {
            "property": "where2",
            "enabled": true,
            "label": "Where2",
            "tags": ["property:type=location"],
            "composite": [
                "city",
                "state"
            ]
        },
        {
            "property": "zip_centroid",
            "enabled": true,
            "label": "Zip centroid",
            "tags": ["property:type=location"],
            "composite": [
                "zip"
            ]
        },
        {
            "property": "when",
            "enabled": true,
            "label": "When",
            "tags": ["property:type=date"],
            "composite": [
                "start"
            ]
        },
        {
            "property": "when2",
            "enabled": true,
            "label": "When2",
            "tags": ["property:type=date"],
            "composite": [
                "end"
            ]
        }
        ]
    }
}
