import matplotlib.pyplot as plt


def generate_bar_chart(
    data,
    labels,
    filename
):

    plt.figure()

    plt.bar(
        labels,
        data
    )

    plt.savefig(
        filename
    )

    plt.close()
