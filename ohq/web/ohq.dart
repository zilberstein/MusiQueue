library ohq;

import 'package:ohq/model.dart';
import 'package:web_ui/web_ui.dart';

@observable List<Person> queue = [];

void main() {
  queue.add(new Person("Tiernan"));
}
