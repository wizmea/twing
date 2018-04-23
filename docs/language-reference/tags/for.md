`for`
=====

{% raw %}

Loop over each item in a sequence. For example, to display a list of users provided in a variable called `users`:

````twig
<h1>Members</h1>
<ul>
    {% for user in users %}
        <li>{{ user.username|e }}</li>
    {% endfor %}
</ul>
````

If you do need to iterate over a sequence of numbers, you can use the `..` operator:

````twig
{% for i in 0..10 %}
    * {{ i }}
{% endfor %}
````

The above snippet of code would print all numbers from 0 to 10.

It can be also useful with letters:

````twig
{% for letter in 'a'..'z' %}
    * {{ letter }}
{% endfor %}
````

The `..` operator can take any expression at both sides:

````twig
{% for letter in 'a'|upper..'z'|upper %}
    * {{ letter }}
{% endfor %}
````

> If you need a step different from 1, you can use the `range` function instead.

## The `loop` variable

Inside of a `for` loop block you can access some special variables:

````
================= =============================================================
Variable          Description
================= =============================================================
loop.index        The current iteration of the loop. (1 indexed)
loop.index0       The current iteration of the loop. (0 indexed)
loop.revindex     The number of iterations from the end of the loop (1 indexed)
loop.revindex0    The number of iterations from the end of the loop (0 indexed)
loop.first        True if first iteration
loop.last         True if last iteration
loop.length       The number of items in the sequence
loop.parent       The parent context
================= =============================================================
````

````twig
{% for user in users %}
    {{ loop.index }} - {{ user.username }}
{% endfor %}
````

> The `loop.length`, `loop.revindex`, `loop.revindex0`, and `loop.last` variables are not available when looping with a condition.

## Adding a condition

It's not possible to interrupt a loop. You can however filter the sequence during iteration which allows you to skip items. The following example skips all the users which are not active:

````twig
<ul>
    {% for user in users if user.active %}
        <li>{{ user.username|e }}</li>
    {% endfor %}
</ul>
````

The advantage is that the special loop variable will count correctly thus not counting the users not iterated over. Keep in mind that properties like `loop.last` will not be defined when using loop conditions.

> Using the `loop` variable within the condition is not recommended as it will probably not be doing what you expect it to. For instance, adding a condition like `loop.index > 4` won't work as the index is only incremented when the condition is true (so the condition will never match).

## The `else` Clause

If no iteration took place because the sequence was empty, you can render a replacement block by using `else`:

````twig
<ul>
    {% for user in users %}
        <li>{{ user.username|e }}</li>
    {% else %}
        <li><em>no user found</em></li>
    {% endfor %}
</ul>
````

## Iterating over Keys

By default, a loop iterates over the values of the sequence. You can iterate on keys by using the `keys` filter:

````twig
<h1>Members</h1>
<ul>
    {% for key in users|keys %}
        <li>{{ key }}</li>
    {% endfor %}
</ul>
````

## Iterating over Keys and Values

You can also access both keys and values:

````twig
<h1>Members</h1>
<ul>
    {% for key, user in users %}
        <li>{{ key }}: {{ user.username|e }}</li>
    {% endfor %}
</ul>
````

{% endraw %}

[back]({{ site.baseurl }}{% link language-reference/tags/index.md %})
