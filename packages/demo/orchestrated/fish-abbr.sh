#!/usr/bin/env bash

cat <<EOF
abbr demo-create-customer 'http POST http://localhost/api/command Host:commands.localhost aggregateName=customer aggregateId=customer-1 command=CREATE payload[name]="Peter Smith" payload[location]=Somewhere'

abbr demo-create-order 'http POST http://localhost/api/command Host:commands.localhost aggregateName=order aggregateId=order-1 command=CREATE payload[customerId]=customer-1 payload[text]="Rubber chicken" payload[value]=13.99'

abbr demo-query-customers 'http GET http://localhost/query/overview/all Host:rm-customers.localhost'

abbr demo-query-orders 'http GET http://localhost/query/overview/all Host:rm-orders.localhost'

abbr demo-modify-customer 'http POST http://localhost/api/command Host:commands.localhost aggregateName=customer aggregateId=customer-1 command=UPDATE payload[name]="Peter Smith (changed externally)"'

EOF

