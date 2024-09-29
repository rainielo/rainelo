/* eslint-disable */
new Vue({
    el: '#app',
    data() {
        return {
            cciData: {},
            REGION: [
                'Sydney',
                'Melbourne',
                'Brisbane',
                'Canberra',
                'Gold Coast',
                'Adelaide',
                'Perth',
                'Darwin',
            ],
            form: {
                region: '',
                workType: '',
                description: '',
                detailDescription: '',
                unitOfMeasure: '',
            },
            visible: false,
            num: '',
            unitSwitch: '㎡',
            tableData: [],
            loading: false,
            result: null

            // 通过接口返回的数据
        }
    },
    methods: {
        resetField(fields = []) {
            const value = fields.reduce((obj, cur) => {
                obj[cur] = ''
                return obj
            }, {})
            this.form = Object.assign(this.form, value)
        },
        getUnitLabel(unit) {
            switch (unit) {
                case 'AUD $/bed':
                    return ' Beds'
                case 'AUD $/car':
                    return ' Cars'
                case 'AUD $/seat':
                    return ' Seats'
                case 'AUD $/bedroom':
                    return ' Bedrooms'
                case 'AUD $/berth':
                    return ' Berths'
                case 'AUD $/pool':
                    return ' Pools'
                case 'AUD $/court':
                    return ' Courts'
                case 'AUD $/unit':
                    return ' Units'
                case 'AUD $/hectare':
                    return ' Hectares'
                case 'AUD $/workstation':
                    return ' Workstations'
                default:
                    return ' Floor Area'
            }
        },
        getUnitPlaceHolder(unit) {
            switch (unit) {
                case 'AUD $/bed':
                    return 'Total Number of Beds'
                case 'AUD $/car':
                    return 'Total Number of Cars'
                case 'AUD $/seat':
                    return 'Total Number of Seats'
                case 'AUD $/bedroom':
                    return 'Total Number of Bedrooms'
                case 'AUD $/berth':
                    return 'Total Number of Berths'
                case 'AUD $/pool':
                    return 'Total Number of Pools'
                case 'AUD $/court':
                    return 'Total Number of Court'
                case 'AUD $/unit':
                    return 'Total Number of Units'
                case 'AUD $/hectare':
                    return 'Total Number of Hectares'

                default:
                    return 'Floor Area'
            }
        },
        clickEnterBtn() {
            if (Number.isInteger(+this.num)) {
                this.tableData = this.tableData.concat([
                    {
                        unitOfMeasure: this.num + this.getUnitLabel(this.result.unitOfMeasure),
                        low: this.num * this.result.low,
                        high: this.num * this.result.high
                    }
                ]);
            }
        },
        numberFormat(row, column, value) {
            // 先进行平方英尺和平方米的转换 1平方英尺(sq.ft) = 0.092903平方米(㎡)
            let temp = value
            if (this.unitSwitch === 'sq ft') {
                temp = value * 0.092903
            }

            if (temp >= 1000000000) {
                return Math.floor((temp / 1000000000) * 100) / 100 + 'B'
            } else if (temp >= 1000000) {
                return Math.floor((temp / 1000000) * 100) / 100 + 'M'
            } else {
                return Math.floor(temp).toLocaleString();
            }
        },
        clickCalculateBtn() {
            // 开始计算结果
            try {
                const result = this.regionArray.find(item => {
                    return `${this.form.region}${this.form.workType}${this.form.description}${this.form.detailDescription}${this.form.unitOfMeasure}`
                        === `${item.region}${item.workType}${item.description}${item.detailDescription || ''}${item.unitOfMeasure}`
                })

                this.result = result

                this.tableData = [this.result]
            } catch (e) {
                this.$message.error('No Results Found')
            }
        },
    },
    watch: {
        form: {
            handler(v) {
                this.result = null
                this.num = ''
            },
            deep: true
        }
    },
    computed: {
        regionArray() {
            if (this.form.region) return this.cciData[this.form.region][this.form.region]
            return []
        },
        WORK_TYPE() {
            // 联动计算选项
            try {
                return [...new Set(this.regionArray.map(item => item.workType))]
            } catch (e) {
                return []
            }
        },
        DESCRIPTION() {
            // 联动计算选项
            try {
                return [...new Set(this.regionArray
                    .filter(item => (item.workType === this.form.workType))
                    .map(item => item.description))]
            } catch (e) {
                return []
            }
        },
        DETAIL_DESCRIPTION() {
            // 联动计算选项
            try {
                return [...new Set(this.regionArray
                    .filter(item => (item.workType === this.form.workType))
                    .filter(item => (item.description === this.form.description))
                    .map(item => item.detailDescription))].filter(Boolean)
            } catch (e) {
                return []
            }
        },
        UNIT_OF_MEASURE() {
            // 联动计算选项
            try {
                return [...new Set(this.regionArray
                    .filter(item => (item.workType === this.form.workType))
                    .filter(item => (item.description === this.form.description))
                    .filter(item => this.DETAIL_DESCRIPTION.length ? (item.detailDescription === this.form.detailDescription) : true) // 兼容空值的情况
                    .map(item => item.unitOfMeasure))]
            } catch (e) {
                return []
            }
        },
        disabled() {
            // 全部都选上了才显示结果栏
            if (this.DETAIL_DESCRIPTION.length && !this.form.detailDescription) return true

            return [
                this.form.region,
                this.form.workType,
                this.form.description,
                this.form.unitOfMeasure,
            ].some(item => (item === ''))
        }
    },
    created() {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', './json/cci.json', true);

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                window.__CALCULATE_CONFIG__ = response;
                this.cciData = response;
            }
        };

        xhr.send();

    }
})